"""Theme tools use local Forge data and share its generation queue lock."""
import mimetypes
import re
from pathlib import Path
from fastapi import Request, Body
from fastapi.responses import FileResponse, JSONResponse
from scripts.lib.store import LobeStore
from scripts.lib import choices, loras, system
from scripts.lib.memory_keeper import api as memory_api


def register(app):
    store = LobeStore()
    assets = (Path(__file__).parents[2] / "assets").resolve()
    mimetypes.add_type("font/woff2", ".woff2")

    @app.get("/lobe/history")
    def history(offset: int = 0, limit: int = 40, q: str = "", tab: str = "", status: str = ""):
        return store.list_history(offset, limit, q, tab, status)

    @app.post("/lobe/history")
    def add_history(payload: dict = Body(...)):
        try:
            return store.add_history(payload)
        except (ValueError, TypeError, OverflowError) as error:
            return JSONResponse({"error": str(error)}, status_code=400)

    @app.delete("/lobe/history/{entry_id}")
    def delete_history(entry_id: str):
        return {"deleted": store.delete_history(entry_id)}

    @app.delete("/lobe/history")
    def clear_history():
        return {"deleted": store.clear_history()}

    @app.get("/lobe/history/thumbs/{name}")
    def thumb(name: str):
        target = store.thumb_path(name)
        return FileResponse(target) if target else JSONResponse({"error": "Not found"}, status_code=404)

    @app.get("/lobe/history/images/{name}")
    def history_image(name: str):
        path = store.folder / "history" / "images" / name
        if not re.fullmatch(r"[0-9a-f]{32}_\d{1,2}\.png", name) or not path.is_file():
            return JSONResponse({"error": "Not found"}, status_code=404)
        return FileResponse(path, media_type="image/png")

    @app.get("/lobe/userdata/{key}")
    def get_data(key: str):
        try:
            return {"value": store.get_userdata(key)}
        except ValueError as error:
            return JSONResponse({"error": str(error)}, status_code=400)

    @app.put("/lobe/userdata/{key}")
    def put_data(key: str, payload: dict = Body(...)):
        try:
            store.set_userdata(key, payload.get("value"))
            return {"ok": True}
        except (ValueError, TypeError) as error:
            return JSONResponse({"error": str(error)}, status_code=400)

    @app.get("/lobe/loras")
    def get_loras():
        return loras.list_loras()

    @app.get("/lobe/model")
    def get_model():
        return loras.current_model()

    @app.get("/lobe/choices")
    def get_choices():
        return choices.choices()

    @app.get("/lobe/system")
    def get_system():
        return system.stats()

    @app.get("/lobe/assets/{path:path}")
    def get_asset(path: str):
        target = (assets / path).resolve()
        if assets not in target.parents or not target.is_file():
            return JSONResponse({"error": "Not found"}, status_code=404)
        return FileResponse(target, headers={"Cache-Control": "public, max-age=86400"})

    from modules import shared
    if not isinstance(getattr(shared, "memory_holders", None), list):
        shared.memory_holders = []
    memory_api.register(app)
