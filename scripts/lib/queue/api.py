import json
from hmac import compare_digest
from pathlib import Path

from fastapi import Body, Depends, HTTPException, Request
from fastapi.security import HTTPBasic

from .runner import LobeTaskRunner
from .storage import QueueStore

runner = None
ready = False


def prepare():
    from modules import extensions, shared

    global ready
    ready = False
    store = QueueStore()
    try:
        old = next((ext for ext in extensions.extensions if ext.canonical_name == "agent-scheduler-neo"), None)
        if old:
            path = Path(getattr(shared.cmd_opts, "agent_scheduler_sqlite_file", None) or Path(old.path) / "task_scheduler.sqlite3")
            if not path.is_absolute():
                path = Path(old.path) / path
            try:
                store.migrate(path)
            except Exception as error:
                print(f"[Lobe queue] Migration warning (continuing with Lobe Queue): {error}")
            old.enabled = False
    finally:
        store.close()
    ready = True


def register(app, block):
    global runner
    if not ready:
        return
    if runner:
        runner.stop()
        if runner.thread.is_alive():
            print("[Lobe queue] Previous worker is still finishing its job")
            return
    store = QueueStore()
    runner = LobeTaskRunner(store, block)
    worker = runner
    basic = HTTPBasic(auto_error=False)

    def authorize(request: Request, credentials=Depends(basic)):
        from modules import shared
        api_auth = getattr(shared.cmd_opts, "api_auth", None)
        if credentials and api_auth:
            for configured in api_auth.split(","):
                username, _, password = configured.partition(":")
                if compare_digest(credentials.username.encode(), username.encode()) and compare_digest(credentials.password.encode(), password.encode()):
                    return username
        if getattr(app, "auth_dependency", None):
            username = app.auth_dependency(request)
            if username:
                return username
        if getattr(app, "auth", None):
            token = request.cookies.get(f"access-token-{app.cookie_id}") or request.cookies.get(f"access-token-unsecure-{app.cookie_id}")
            username = app.tokens.get(token)
            if username:
                return username
        if api_auth or getattr(app, "auth", None) or getattr(app, "auth_dependency", None):
            raise HTTPException(401, "Authentication required")
        return None

    protected = [Depends(authorize)]

    def start():
        worker.wakeup.set()

    @app.get("/lobe/queue", dependencies=protected)
    @app.get("/agent-scheduler/v1/queue", dependencies=protected)
    def queue():
        items = store.list_queue()
        return {"items": items, "count": len(items), "paused": worker.paused,
                "completion": store.get_userdata("queueCompletion") or "none"}

    @app.post("/lobe/queue/ui")
    @app.post("/agent-scheduler/v1/queue/ui")
    async def enqueue(body: dict = Body(...), username=Depends(authorize)):
        from modules import sd_models, shared
        tab = "img2img" if body.get("is_img2img") else "txt2img"
        args = body.get("args")
        if not isinstance(args, list) or len(args) < 4:
            raise HTTPException(400, "Missing generation arguments")
        models = list(sd_models.checkpoints_list)
        preset = str(getattr(shared.opts, "forge_preset", "") or "").strip()
        if preset.lower() in ("all", "none"):
            preset = ""
        from scripts.lib import loras

        def matches_preset(title: str) -> bool:
            if not preset:
                return True
            info = sd_models.checkpoints_list.get(title)
            if info is None:
                return False
            arch = loras.checkpoint_arch(info)
            return arch == preset

        mode = body.get("mode", "single" if body.get("checkpoint") not in (None, "", "Current Checkpoint") else "current")
        selected = body.get("checkpoint")
        resolved = None
        if isinstance(selected, str) and selected.strip():
            if selected in models:
                resolved = selected
            else:
                matched = sd_models.get_closet_checkpoint_match(selected)
                if matched is not None and matched.title in models:
                    resolved = matched.title

        if mode == "current":
            current = sd_models.get_closet_checkpoint_match(getattr(shared.opts, "sd_model_checkpoint", "") or "")
            checkpoints = [current.title if current else None]
        elif mode == "single" and resolved:
            if not matches_preset(resolved):
                raise HTTPException(400, f"Checkpoint does not match active UI preset ({preset})")
            checkpoints = [resolved]
        elif mode == "all":
            checkpoints = [title for title in models if matches_preset(title)]
        elif mode == "folder" and resolved:
            if not matches_preset(resolved):
                raise HTTPException(400, f"Checkpoint does not match active UI preset ({preset})")
            folder = Path(sd_models.checkpoints_list[resolved].filename).parent
            checkpoints = [
                title for title in models
                if Path(sd_models.checkpoints_list[title].filename).parent == folder and matches_preset(title)
            ]
        else:
            raise HTTPException(400, "Unknown checkpoint selection")
        if not checkpoints:
            raise HTTPException(400, "No matching checkpoints")
        try:
            values = await worker.preprocess(tab, args)
            from types import SimpleNamespace
            params, scripts, vae = worker.snapshot(tab, values, SimpleNamespace(username=username))
            with store.lock, store.connect() as db:
                db.execute("BEGIN IMMEDIATE")
                ids = [store.insert(db, tab, params, scripts, checkpoint=model, vae=vae,
                                    infotext=str(params["args"].get("prompt", ""))) for model in checkpoints]
        except (ValueError, TypeError, KeyError) as error:
            raise HTTPException(400, str(error)) from error
        start()
        return {"task_id": ids[0], "ids": ids}

    def enqueue_api(tab: str, body: dict = Body(...), _user=Depends(authorize)):
        from modules import sd_models
        from .task_helpers import serialize_api_task_args, serialize_script_args
        if tab not in ("txt2img", "img2img"):
            raise HTTPException(404, "Unknown generation tab")
        checkpoint, vae = body.pop("checkpoint", None), body.pop("vae", None)
        if checkpoint is not None and (not isinstance(checkpoint, str) or checkpoint not in sd_models.checkpoints_list):
            raise HTTPException(400, "Unknown checkpoint")
        try:
            named = serialize_api_task_args(body, tab == "img2img", checkpoint=checkpoint, vae=vae)
            scripts = serialize_script_args(named.pop("script_args", []))
            with store.lock, store.connect() as db:
                db.execute("BEGIN IMMEDIATE")
                entry_id = store.insert(db, tab, {"args": named, "is_ui": False, "is_img2img": tab == "img2img"},
                                        scripts, checkpoint=checkpoint, vae=vae, infotext=str(named.get("prompt", "")))
        except (ValueError, TypeError, AttributeError, KeyError) as error:
            raise HTTPException(400, str(error)) from error
        start()
        return {"task_id": entry_id}

    @app.patch("/lobe/queue", dependencies=protected)
    def settings(request: Request, body: dict = Body(...), user=Depends(authorize)):
        action = body.get("completion")
        if "paused" in body and not isinstance(body["paused"], bool):
            raise HTTPException(400, "Invalid pause state")
        if action is not None:
            if action not in ("none", "sleep", "hibernate", "shutdown", "stop"):
                raise HTTPException(400, "Unknown completion action")
            if action != "none" and not user and (not request.client or request.client.host not in ("127.0.0.1", "::1")):
                raise HTTPException(403, "Completion actions require a local or authenticated session")
            store.set_userdata("queueCompletion", action)
        if "paused" in body:
            worker.set_paused(body["paused"])
        return queue()

    @app.delete("/lobe/queue", dependencies=protected)
    @app.post("/agent-scheduler/v1/queue/clear", dependencies=protected)
    def clear_queue():
        return {"deleted": store.cancel_pending()}

    @app.post("/agent-scheduler/v1/queue/pause", dependencies=protected)
    def pause():
        worker.set_paused(True)
        return queue()

    @app.post("/agent-scheduler/v1/queue/resume", dependencies=protected)
    def resume():
        worker.set_paused(False)
        return queue()

    @app.get("/lobe/task/{entry_id}", dependencies=protected)
    @app.get("/agent-scheduler/v1/task/{entry_id}", dependencies=protected)
    def task(entry_id: str):
        row = store.get(entry_id)
        if row is None:
            raise HTTPException(404, "Task not found")
        return store.entry(row)

    @app.patch("/lobe/task/{entry_id}", dependencies=protected)
    def update(entry_id: str, body: dict = Body(...)):
        from modules import sd_models
        row = store.get(entry_id)
        if row is None:
            raise HTTPException(404, "Task not found")
        if body.get("checkpoint") is not None and (not isinstance(body["checkpoint"], str) or body["checkpoint"] not in sd_models.checkpoints_list):
            raise HTTPException(400, "Unknown checkpoint")
        if "name" in body and body["name"] is not None and not isinstance(body["name"], str):
            raise HTTPException(400, "Invalid name")
        if "bookmarked" in body and not isinstance(body["bookmarked"], bool):
            raise HTTPException(400, "Invalid bookmark")
        return store.patch_task(row["id"], body)

    @app.post("/lobe/task/{entry_id}/move", dependencies=protected)
    def move(entry_id: str, body: dict = Body(...)):
        direction = body.get("direction")
        if direction not in (-1, 1):
            raise HTTPException(400, "Invalid move")
        return {"moved": store.move_task(entry_id, direction)}

    @app.delete("/lobe/task/{entry_id}", dependencies=protected)
    def cancel(entry_id: str):
        return {"deleted": store.cancel_pending(entry_id)}

    @app.post("/lobe/task/{entry_id}/requeue", dependencies=protected)
    @app.post("/agent-scheduler/v1/task/{entry_id}/requeue", dependencies=protected)
    def requeue(entry_id: str):
        row = store.get(entry_id)
        if row is None:
            raise HTTPException(404, "Task not found")
        ids = store.requeue(row["id"])
        start()
        return {"ids": ids}

    @app.post("/lobe/queue/requeue-failed", dependencies=protected)
    @app.post("/agent-scheduler/v1/task/requeue-failed", dependencies=protected)
    def requeue_failed():
        ids = store.requeue()
        start()
        return {"ids": ids}

    @app.get("/lobe/queue/export", dependencies=protected)
    @app.get("/agent-scheduler/v1/queue/export", dependencies=protected)
    def export_queue():
        items = []
        from .task_helpers import unpack_script_args
        for item in store.list_queue():
            if item["status"] != "pending":
                continue
            row = store.get(item["id"])
            data = json.loads(row["params"])
            if row["script_params"] and "script_args" not in data:
                data["script_args"] = unpack_script_args(row["script_params"])
            items.append({**{key: row[key] for key in ("tab", "checkpoint", "vae", "name")}, "params": data})
        return {"version": 1, "items": items}

    @app.post("/lobe/queue/import", dependencies=protected)
    @app.post("/agent-scheduler/v1/queue/import", dependencies=protected)
    def import_queue(body: dict = Body(...)):
        items = body.get("items")
        if body.get("version") != 1 or not isinstance(items, list) or len(items) > 1000:
            raise HTTPException(400, "Invalid queue export")
        from modules import sd_models
        try:
            with store.lock, store.connect() as db:
                db.execute("BEGIN IMMEDIATE")
                for item in items:
                    tab, params = item["tab"], item["params"]
                    checkpoint = item.get("checkpoint")
                    if (tab not in ("txt2img", "img2img") or not isinstance(params.get("args"), dict)
                        or not isinstance(params.get("script_args", []), list)
                        or (checkpoint is not None and checkpoint not in sd_models.checkpoints_list)):
                        raise ValueError("Invalid task parameters")
                    store.insert(db, tab, params, name=item.get("name"), checkpoint=checkpoint, vae=item.get("vae"),
                                 infotext=str(params["args"].get("prompt", "")))
        except (ValueError, TypeError, KeyError, AttributeError) as error:
            raise HTTPException(400, str(error)) from error
        start()
        return {"imported": len(items)}

    @app.get("/agent-scheduler/v1/history", dependencies=protected)
    def history(status: str = "", limit: int = 20, offset: int = 0):
        return store.list_history(offset, limit, status=status)

    @app.post("/agent-scheduler/v1/task/{entry_id}/run", dependencies=protected)
    def run_now(entry_id: str):
        row = store.get(entry_id)
        if row is None or not store.prioritize(row["id"]):
            raise HTTPException(409, "Task is not waiting")
        worker.set_paused(False)
        return {"task_id": row["id"]}

    @app.post("/agent-scheduler/v1/task/{entry_id}/bookmark", dependencies=protected)
    @app.post("/agent-scheduler/v1/task/{entry_id}/unbookmark", dependencies=protected)
    def bookmark(entry_id: str, request: Request):
        row = store.get(entry_id)
        if row is None:
            raise HTTPException(404, "Task not found")
        return store.patch_task(row["id"], {"bookmarked": request.url.path.endswith("/bookmark")})

    for prefix in ("/lobe", "/agent-scheduler/v1"):
        app.add_api_route(f"{prefix}/queue/{{tab}}", enqueue_api, methods=["POST"])
