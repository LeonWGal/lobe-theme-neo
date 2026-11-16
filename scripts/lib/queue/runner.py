import inspect
import json
import threading
from functools import wraps
from math import isfinite

from .storage import QueueStore


class LobeTaskRunner:
    def __init__(self, store, block):
        from modules import script_callbacks
        from .helpers import detect_control_net, get_component_by_elem_id
        from .forge_neveroom_compat import apply_neveroom_compat

        self.store: QueueStore = store
        self.lock = threading.RLock()
        self.wakeup = threading.Event()
        self.paths = {}
        self.interrupted = set()
        self.inputs = {}
        self.stopped = False
        self.current = None
        self.paused = bool(store.get_userdata("queuePaused"))
        submit = get_component_by_elem_id(block, "txt2img_generate") if block else None
        self.unit = detect_control_net(block, submit) if submit else None
        apply_neveroom_compat()
        store.recover()
        from modules import progress, shared
        finish = progress.finish_task

        def track_finish(job):
            with self.lock:
                if job in self.paths and (shared.state.interrupted or shared.state.stopping_generation):
                    self.interrupted.add(job)
            return finish(job)

        progress.finish_task = track_finish
        self.release_finish = lambda: setattr(progress, "finish_task", finish) if progress.finish_task is track_finish else None
        self.bind_history(block)
        self.thread = threading.Thread(target=self.run, name="lobe-generation-queue", daemon=True)
        script_callbacks.on_image_saved(self.image_saved)
        script_callbacks.on_before_reload(self.stop)
        self.thread.start()

    def stop(self):
        from modules import script_callbacks
        self.stopped = True
        self.wakeup.set()
        self.release_finish()
        if self.thread is not threading.current_thread():
            self.thread.join(timeout=2)
        if not self.thread.is_alive():
            script_callbacks.remove_callbacks_for_function(self.image_saved)
            script_callbacks.remove_callbacks_for_function(self.stop)

    def set_paused(self, paused):
        with self.lock:
            self.store.set_userdata("queuePaused", paused)
            self.paused = paused
            self.wakeup.set()

    def image_saved(self, data):
        from modules import progress
        with self.lock:
            if progress.current_task in self.paths and data.filename:
                self.paths[progress.current_task].append(data.filename)

    @staticmethod
    def snapshot(tab, args, request=None):
        from modules import shared
        from . import task_helpers as helpers

        img = tab == "img2img"
        named, scripts = helpers.map_ui_task_args_list_to_named_args(list(args), img)
        if img:
            helpers.serialize_img2img_image_args(named)
        if "request" in named:
            username = getattr(request, "username", None)
            named["request"] = {"username": username}
        scripts = helpers.normalize_adetailer_script_args(scripts, is_img2img=img)
        scripts = helpers.normalize_xyz_grid_script_args(scripts, is_img2img=img)
        scripts = helpers.serialize_script_args(scripts)
        return {"args": named, "is_ui": True, "is_img2img": img}, scripts, getattr(shared.opts, "sd_vae", None)

    def bind_history(self, block):
        if block is None:
            return
        from modules import img2img, txt2img
        for item in getattr(block, "fns", {}).values():
            fn = getattr(item, "fn", None)
            target = inspect.unwrap(fn) if fn else None
            if target in (txt2img.txt2img, img2img.img2img):
                tab = "img2img" if target is img2img.img2img else "txt2img"
                if item.inputs and (tab not in self.inputs or len(item.inputs) > len(self.inputs[tab].inputs)):
                    self.inputs[tab] = item
                item.fn = self.track_native(fn, tab)

    async def preprocess(self, tab, args):
        from gradio import processing_utils
        from gradio.components import Number, Slider
        from gradio.exceptions import Error as GradioError

        dependency = self.inputs.get(tab)
        if not dependency:
            raise ValueError("Generation inputs no longer match Forge; reload WebUI")
        args = list(args)
        expected_len = len(dependency.inputs)
        if len(args) != expected_len:
            outputs_len = len(getattr(dependency, "outputs", None) or ())
            if outputs_len and len(args) == expected_len + outputs_len:
                args = args[:expected_len]
            elif expected_len - 4 <= len(args) < expected_len:
                for comp in dependency.inputs[len(args):]:
                    args.append(getattr(comp, "value", None))
            else:
                raise ValueError("Generation inputs no longer match Forge; reload WebUI")
        result = []
        for component, value in zip(dependency.inputs, args):
            if component.stateful:
                result.append(value)
                continue
            if isinstance(component, Number) and component.label == "Seed for upsampling tags":
                if value is None or (isinstance(value, str) and not value.strip()):
                    value = -1
            if isinstance(component, (Number, Slider)) and isinstance(value, str):
                field = component.label or component.elem_id or component.get_block_name()
                try:
                    text = value.strip()
                    value = int(text) if text.lstrip("+-").isdecimal() else float(text)
                    if isinstance(value, float) and not isfinite(value):
                        raise ValueError
                except ValueError:
                    raise ValueError(f"{field}: expected a number") from None
            if type(value) is int and getattr(component, "type", None) == "index":
                choices = getattr(component, "choices", None)
                if choices and 0 <= value < len(choices):
                    result.append(value)
                    continue
            if isinstance(value, dict) and not value.get("path") and isinstance(value.get("url"), str) and value["url"].startswith("data:"):
                cached_path = processing_utils.save_base64_to_cache(value["url"], cache_dir=component.GRADIO_CACHE)
                value = {"path": cached_path}
            cached = await processing_utils.async_move_files_to_cache(value, component, check_in_upload_folder=True)
            model = getattr(component, "data_model", None)
            if model and cached is not None:
                from gradio.data_classes import GradioModel, GradioRootModel
                if issubclass(model, GradioRootModel):
                    cached = model(root=cached)
                elif issubclass(model, GradioModel):
                    cached = model(**cached)
            try:
                result.append(component.preprocess(cached))
            except GradioError as error:
                field = component.label or component.elem_id or component.get_block_name()
                raise ValueError(f"{field}: {error.message}") from error
        return result

    def track_native(self, fn, tab):
        @wraps(fn)
        def tracked(job, request, *args, **kwargs):
            if not isinstance(job, str) or not job.startswith("task("):
                return fn(job, request, *args, **kwargs)
            try:
                params, scripts, vae = self.snapshot(tab, [job, *args], request)
                from modules import shared
                with self.store.lock, self.store.connect() as db:
                    entry_id = self.store.insert(db, tab, params, scripts, job=job,
                                                 status="running", vae=vae, queued=False,
                                                 checkpoint=getattr(shared.opts, "sd_model_checkpoint", None),
                                                 infotext=str(params["args"].get("prompt", "")))
            except Exception:
                return fn(job, request, *args, **kwargs)
            with self.lock:
                self.paths[job] = []
            try:
                result = fn(job, request, *args, **kwargs)
            except Exception as error:
                self.record_completion(entry_id, job, None, str(error))
                raise
            self.record_completion(entry_id, job, result)
            return result
        return tracked

    def record_completion(self, *args):
        try:
            self.complete(*args)
        except Exception as error:
            print(f"[Lobe queue] Could not record generation: {error}")

    def complete(self, entry_id, job, result, error=None, interrupted=False):
        from . import task_helpers as helpers
        with self.lock:
            paths = self.paths.pop(job, [])
            interrupted = interrupted or job in self.interrupted
            self.interrupted.discard(job)
        data = helpers.extract_generation_info(result) or helpers.geninfo_from_saved_images(paths) or {}
        error = error or helpers.extract_ui_task_error(result, None)
        info = next((value for value in data.get("infotexts", []) if value), "")
        if not paths and isinstance(result, (list, tuple)) and result and isinstance(result[0], dict):
            from PIL import Image
            target = self.store.folder / "history" / "images"
            for index, image in enumerate((result[0].get("value") or [])[:16]):
                if not isinstance(image, Image.Image):
                    continue
                target.mkdir(parents=True, exist_ok=True)
                path = target / f"{entry_id}_{index}.png"
                image.save(path)
                paths.append(str(path))
        status = "interrupted" if interrupted else "failed" if error or not (paths or data) else "done"
        self.store.finish(entry_id, status, paths, info, (error or "No generation output was returned") if status == "failed" else None)

    def execute(self, row):
        from modules import img2img, progress, shared, txt2img
        from modules.call_queue import queue_lock
        from modules_forge import main_thread
        from . import task_helpers as helpers
        from .forge_neveroom_compat import prepare_for_queued_inference

        job, entry_id = row["job"], row["id"]
        img = row["tab"] == "img2img"
        with self.lock:
            self.paths[job] = []
        result = error = None
        interrupted = False
        try:
            data = json.loads(row["params"])
            named = data["args"]
            scripts = helpers.deserialize_script_args(data.get("script_args", row["script_params"] or []), self.unit, is_img2img=img)
            if data.get("is_ui", True):
                from types import SimpleNamespace
                named["id_task"] = job
                named["request"] = SimpleNamespace(**(named.get("request") or {}))
                overrides = named.get("override_settings_texts") or []
                for field, label in (("checkpoint", "Model"), ("vae", "VAE")):
                    if row[field] and row[field] != "System":
                        overrides = [x for x in overrides if not x.startswith(label + ":")]
                        overrides.append(f"{label}: {row[field]}")
                named["override_settings_texts"] = overrides
                if img:
                    helpers.deserialize_img2img_image_args(named)
                args = helpers.map_named_args_to_ui_task_args_list(named, scripts, img)
                with queue_lock:
                    if self.stopped:
                        self.store.finish(entry_id, "interrupted", error="WebUI is reloading")
                        with self.lock:
                            self.paths.pop(job, None)
                        return
                    prepare_for_queued_inference()
                    previous = shared.opts.samples_save
                    started = False
                    try:
                        shared.opts.samples_save = True
                        shared.state.begin(job=job)
                        progress.start_task(job)
                        started = True
                        main_thread.last_exception = None
                        result = (img2img.img2img if img else txt2img.txt2img)(*args)
                        error = helpers.extract_ui_task_error(result, main_thread.last_exception)
                        interrupted = bool(shared.state.interrupted or shared.state.stopping_generation)
                        if not error and isinstance(result, (list, tuple)) and len(result) == 5:
                            progress.record_results(job, (result[0], *result[2:]))
                    finally:
                        shared.opts.samples_save = previous
                        if started:
                            progress.finish_task(job)
                            shared.state.end()
            else:
                from fastapi import FastAPI
                from modules.api.api import Api
                from modules.api.models import StableDiffusionImg2ImgProcessingAPI, StableDiffusionTxt2ImgProcessingAPI
                api = Api(FastAPI(), queue_lock)
                override = named.setdefault("override_settings", {})
                for field, key in (("checkpoint", "sd_model_checkpoint"), ("vae", "sd_vae")):
                    if row[field] and row[field] != "System":
                        override[key] = row[field]
                named.update(save_images=True, send_images=False, force_task_id=job)
                if scripts:
                    named["script_args"] = scripts
                try:
                    reply = api.img2imgapi(StableDiffusionImg2ImgProcessingAPI(**named)) if img else api.text2imgapi(StableDiffusionTxt2ImgProcessingAPI(**named))
                    result = reply.info
                finally:
                    if progress.current_task == job:
                        progress.finish_task(job)
                    progress.pending_tasks.pop(job, None)
        except Exception as exc:
            error = str(exc) or type(exc).__name__
        if error and ("out of memory" in error.lower() or error.strip().upper() == "OOM"):
            self.set_paused(True)
        self.complete(entry_id, job, result, error, interrupted)

    def run(self):
        from modules import progress
        completed = False
        while not self.stopped:
            self.wakeup.clear()
            with self.lock:
                row = None if (self.paused or progress.current_task or not self.store.has_pending()) else self.store.claim()
                self.current = row["id"] if row else None
            if row is None:
                if completed and not self.paused:
                    if not progress.current_task and not progress.pending_tasks:
                        completed = False
                        self.after_queue()
                self.wakeup.wait(1)
                continue
            try:
                self.execute(row)
                completed = self.store.get(row["id"])["status"] == "done"
            except Exception as error:
                self.store.finish(row["id"], "failed", error=str(error))
            finally:
                with self.lock:
                    self.current = None

    def after_queue(self):
        import ctypes
        import os
        import subprocess

        action = self.store.take_completion_action()
        if action not in ("sleep", "hibernate", "shutdown", "stop"):
            return
        try:
            if action == "stop":
                from .helpers import _exit
                _exit(0)
            elif os.name == "nt":
                if action == "sleep":
                    ctypes.windll.PowrProf.SetSuspendState(False, False, False)
                else:
                    subprocess.Popen(["shutdown", "/h"] if action == "hibernate" else ["shutdown", "/s", "/t", "0"])
            else:
                subprocess.Popen(["systemctl", {"sleep": "suspend", "hibernate": "hibernate", "shutdown": "poweroff"}[action]])
        except Exception as error:
            print(f"[Lobe queue] Completion action failed: {error}")
