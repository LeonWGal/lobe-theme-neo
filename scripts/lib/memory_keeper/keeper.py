"""What the panel asks for: the numbers, one thing moved or let go, everything let go but what is kept (🔒)."""

from __future__ import annotations

import gc
import json
import os
import threading
import time
from pathlib import Path

from . import TAG, measure, sources

LEVELS = ("vram", "ram", "all")
LEVEL_NAMES = {"vram": "VRAM", "ram": "RAM", "all": "VRAM and RAM"}
_lock = threading.RLock()


class Busy(Exception):
    pass


class Missing(Exception):
    pass


# ------------------------------------------------------------------ what you keep


def _state_file():
    base = Path(__file__).parents[3] / "lobe_data"
    base.mkdir(parents=True, exist_ok=True)
    return str(base / "memory_keeper.json")


_state_cache = {"path": None, "sig": None, "data": {}}


def _state():
    path = _state_file()
    try:
        st = os.stat(path)
        sig = (st.st_mtime_ns, st.st_size)
        with _lock:
            if _state_cache["path"] == path and _state_cache["sig"] == sig:
                return dict(_state_cache["data"])
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        parsed = data if isinstance(data, dict) else {}
        with _lock:
            _state_cache["path"] = path
            _state_cache["sig"] = sig
            _state_cache["data"] = parsed
        return dict(parsed)
    except Exception:
        return {}


def pins():
    return set(_state().get("pinned") or [])


def pin(holder_id, keep):
    data = _state()
    kept = set(data.get("pinned") or [])
    (kept.add if keep else kept.discard)(str(holder_id))
    data["pinned"] = sorted(kept)
    path = _state_file()
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=1)
    os.replace(tmp, path)
    with _lock:
        _state_cache["path"] = path
        _state_cache["sig"] = None
        _state_cache["data"] = data
    return sorted(kept)


def opt(name, default):
    try:
        from modules import shared

        value = getattr(shared.opts, name)
        return default if value is None else value
    except Exception:
        return default


# ------------------------------------------------------------------ the numbers


def _holders():
    """The holders, each id once (two ControlNets of one class are ControlNet and ControlNet #2)."""
    out, seen = [], {}
    for h in sources.holders():
        n = seen.get(h["id"], 0) + 1
        seen[h["id"]] = n
        if n > 1:
            h = dict(h, id=f"{h['id']} #{n}", name=f"{h['name']} #{n}")
        out.append(h)
    return out


def _usage(h, by_pid=None):
    try:
        u = h["usage"]()
    except Exception as exc:
        return {"error": str(exc)}
    if u is None:
        return None
    u = dict(u)
    pid = h.get("pid")
    pid = pid() if callable(pid) else None
    if pid:
        u["pid"] = pid
        gpu_map = measure.gpu_by_pid() if by_pid is None else by_pid
        real = gpu_map.get(pid)
        if real:
            u["vram"] = real  # what the driver says beats an estimate
        held = measure.process_ram(pid)
        if held:
            u["ram"] = held
    return u


def gauges(kids=None, by_pid=None):
    g, r = measure.gpu(), measure.ram()
    out = {"gpu": g, "ram": r}
    kids = measure.children() if kids is None else kids
    if r is not None:
        r["children"] = sum(k[2] for k in kids)
    if g is not None:
        gpu_map = (measure.gpu_by_pid() if kids else {}) if by_pid is None else by_pid
        g["children"] = sum(gpu_map.get(k[0], 0) for k in kids)
    return out


def status(full=False):
    from . import vram_mode

    kids = measure.children()
    by_pid = measure.gpu_by_pid() if kids else {}
    out = {"gauges": gauges(kids=kids, by_pid=by_pid), "generating": generating(), "vram_mode": vram_mode.info()}
    if not full:
        return out
    kept = pins()
    rows, claimed = [], set()
    for h in _holders():
        u = _usage(h, by_pid=by_pid if kids else None)
        if u is None:
            continue
        if u.get("pid"):
            claimed.add(u["pid"])
        row = {"id": h["id"], "name": h["name"], "category": h.get("category", "other"), "source": h.get("source", ""),
               "kind": h.get("kind", "model"),
               "detail": h.get("detail") if not callable(h.get("detail")) else h["detail"](),
               "usage": u, "pinned": h["id"] in kept, "can_ram": callable(h.get("to_ram")), "can_unload": callable(h.get("unload"))}
        if callable(h.get("parts")):
            row["parts"] = h["parts"]()
            row["can_part_ram"] = callable(h.get("part_to_ram"))
        rows.append(row)
    for pid, name, held in kids:  # started by the WebUI, and no holder says what it is
        if pid not in claimed and held > 64 * 1024 * 1024:
            llm = any(w in name.lower() for w in ("llama", "ollama", "kobold", "vllm", "lmstudio"))
            rows.append({"id": f"process:{pid}", "name": name, "category": "llm" if llm else "process", "source": "", "kind": "process",
                         "detail": f"pid {pid}, started by the WebUI; stop it where it came from",
                         "usage": {"vram": by_pid.get(pid), "ram": held, "pid": pid},
                         "pinned": False, "can_ram": False, "can_unload": False})
    order = {k: i for i, k in enumerate(sources.CATEGORY_KEYS)}
    rows.sort(key=lambda x: order.get(x["category"], len(order)))
    out["holders"] = rows
    out["categories"] = [{"key": k, "name": n, "icon": i} for k, n, i in sources.CATEGORIES]
    out["pinned"] = sorted(kept)
    out["checkpoint_unloads"] = sources.can_unload_checkpoint()
    return out


# ------------------------------------------------------------------ letting go


def generating():
    try:
        from modules import shared

        return bool(shared.state.job) or shared.state.job_count not in (0, None)
    except Exception:
        return False


class _Quiet:
    """Hold the WebUI's queue while the checkpoint is touched: no generation starts in the middle."""

    def __init__(self, needed):
        self.needed, self.lock = needed, None

    def __enter__(self):
        if not self.needed:
            return self
        if generating():
            raise Busy("A generation is running: try again when it is done.")
        try:
            from modules.call_queue import queue_lock
        except Exception:
            raise Busy("Cannot obtain the generation queue lock.")
        if not queue_lock.acquire(False):
            raise Busy("The WebUI is busy (a generation or a model load): try again in a moment.")
        self.lock = queue_lock
        if generating():
            queue_lock.release()
            self.lock = None
            raise Busy("A generation is running: try again when it is done.")
        return self

    def __exit__(self, *exc):
        if self.lock is not None:
            self.lock.release()


def cleanup(give_back=True):
    gc.collect()
    sources.empty_cache()
    if give_back and opt("mk_give_back_ram", True):
        measure.give_back_ram()


def _snapshot():
    g = measure.gpu()
    r = measure.ram()
    return {"vram": g["total"] - g["free"] if g else None, "ram": r["total"] - r["free"] if r else None}


def _freed(before, started):
    after = _snapshot()
    out = {"seconds": round(time.time() - started, 1)}
    for k in ("vram", "ram"):
        if before[k] is not None and after[k] is not None:
            out[k] = max(0, before[k] - after[k])
    return out


def act(holder_id, action, part=None, locked=True):
    """action: "ram" (off the GPU, kept in RAM) or "unload"; part: one part of the checkpoint."""
    if action not in ("ram", "unload"):
        raise Missing("Unknown memory action")
    with _lock:
        h = next((x for x in _holders() if x["id"] == holder_id), None)
        if h is None:
            raise Missing("That is not loaded any more.")
        fn = h.get("part_to_ram") if part else h.get("to_ram" if action == "ram" else "unload")
        if not callable(fn):
            raise Missing(f"{h['name']} cannot do that.")
        started, before = time.time(), _snapshot()
        with _Quiet(locked):
            fn(part) if part else fn()
            cleanup(give_back=action == "unload")
        print(f"{TAG} {h['name']}{' / ' + part if part else ''}: {'to RAM' if action == 'ram' else 'unloaded'}")
        return dict(_freed(before, started), status=status(full=True))


def free(level, locked=True, category=None):
    """Everything but what is kept: "vram" takes it off the GPU (into RAM, or stopped when it has no RAM to go to),
    "ram" lets go of what is only in RAM (models moved off the GPU, caches, servers on the CPU) and leaves the GPU
    alone, "all" lets go of it altogether. category: only that section of the panel."""
    if level not in LEVELS:
        raise Missing("Free what? vram, ram or all.")
    if category and category not in sources.CATEGORY_KEYS:
        raise Missing(f"No such category: {category}")
    with _lock:
        kept = pins()
        started, before = time.time(), _snapshot()
        done, skipped = [], []
        todo = [h for h in _holders() if h["id"] not in kept and (not category or h.get("category") == category)]
        try:
            quiet = _Quiet(locked)
            quiet.__enter__()
        except Busy:
            raise
        try:
            for h in todo:
                u = _usage(h)
                if not u:
                    continue
                if level == "vram":
                    on_gpu = u.get("vram")
                    if on_gpu == 0 or (on_gpu is None and h.get("kind") == "cache"):
                        continue  # nothing of it on the GPU
                    fn = h.get("to_ram") or (h.get("unload") if h.get("kind") != "cache" else None)
                elif level == "ram":
                    if h.get("kind") != "cache" and (u.get("vram") or 0) > 0:
                        continue  # partly on the GPU: unloading it would free VRAM too, which is Free VRAM's call
                    if h.get("kind") != "cache" and not u.get("ram"):
                        continue  # nothing of it known to be in RAM
                    fn = h.get("unload")
                else:
                    fn = h.get("unload") or h.get("to_ram")
                if not callable(fn):
                    continue
                try:
                    fn()
                    done.append(h["name"])
                except Exception as exc:
                    skipped.append(f"{h['name']} ({exc})")
            cleanup(give_back=level != "vram")
        finally:
            quiet.__exit__(None, None, None)
        print(f"{TAG} freed {LEVEL_NAMES[level]}: {', '.join(done) or 'nothing to free'}"
              + (f"; kept {', '.join(sorted(kept))}" if kept else ""))
        return dict(_freed(before, started), done=done, skipped=skipped, kept=sorted(kept), status=status(full=True))


# ------------------------------------------------------------------ after each generation


def after_generation():
    """Settings → Memory Keeper → After each generation: free, once the WebUI's queue is free."""
    level = {"Free VRAM": "vram", "Free RAM": "ram", "Free VRAM and RAM": "all"}.get(str(opt("mk_after_generation", "Off")))
    if not level:
        return

    def later():
        try:
            from modules.call_queue import queue_lock
        except Exception:
            queue_lock = None
        for _ in range(600):
            time.sleep(0.5)
            if generating():
                continue
            if queue_lock is None or queue_lock.acquire(False):
                try:
                    free(level, locked=False)
                except Exception as exc:
                    print(f"{TAG} after the generation: {exc}")
                finally:
                    if queue_lock is not None:
                        queue_lock.release()
                return

    threading.Thread(target=later, name="memory-keeper-after", daemon=True).start()
