"""Bounded theme history and preferences, stored separately from generated outputs."""
import base64
import json
import math
import re
import sqlite3
import threading
import time
import uuid
from contextlib import contextmanager
from pathlib import Path

DATA_FOLDER = Path(__file__).parents[2] / "lobe_data"
HISTORY_LIMIT = 2000
THUMB_NAME = re.compile(r"^[0-9a-f]{32}_\d{1,2}\.(webp|jpg|png)$")
USERDATA_KEYS = re.compile(r"^[A-Za-z][A-Za-z0-9_-]{0,63}$")


_ENTRY_COLS = (
    "id, job, time, tab, infotext, status, priority, bookmarked, name, checkpoint, vae, error, queued, "
    "(params IS NOT NULL AND params != '') AS replayable, images"
)


class LobeStore:
    def __init__(self, folder=None, *, pool=None):
        self.folder = Path(folder) if folder else DATA_FOLDER
        self.folder.mkdir(parents=True, exist_ok=True)
        self.thumbs = self.folder / "history" / "thumbs"
        self.db = self.folder / "theme.sqlite3"
        self.lock = threading.RLock()
        self._pool = (folder is None) if pool is None else bool(pool)
        self._local = threading.local()
        self._conns = []
        self._conns_lock = threading.Lock()
        with self.connect() as db:
            db.execute("PRAGMA journal_mode=WAL")
            db.execute("PRAGMA synchronous=NORMAL")
            db.execute("CREATE TABLE IF NOT EXISTS userdata (key TEXT PRIMARY KEY, value TEXT NOT NULL)")
            db.execute("CREATE TABLE IF NOT EXISTS history (id TEXT PRIMARY KEY, time REAL NOT NULL, tab TEXT NOT NULL, infotext TEXT NOT NULL, images TEXT NOT NULL, job TEXT UNIQUE)")
            db.execute("CREATE INDEX IF NOT EXISTS history_time ON history(time DESC)")
            fields = {row[1] for row in db.execute("PRAGMA table_info(history)")}
            for name, definition in {
                "status": "TEXT NOT NULL DEFAULT 'done'",
                "priority": "INTEGER NOT NULL DEFAULT 0",
                "bookmarked": "INTEGER NOT NULL DEFAULT 0",
                "name": "TEXT", "checkpoint": "TEXT", "vae": "TEXT",
                "params": "TEXT", "script_params": "BLOB", "error": "TEXT", "result": "TEXT",
                "queued": "INTEGER NOT NULL DEFAULT 0",
            }.items():
                if name not in fields:
                    db.execute(f"ALTER TABLE history ADD COLUMN {name} {definition}")
            db.execute("CREATE INDEX IF NOT EXISTS history_queue ON history(status, priority)")
            db.execute("CREATE INDEX IF NOT EXISTS history_status_time ON history(status, time DESC)")
            db.execute("CREATE INDEX IF NOT EXISTS history_tab ON history(tab, time DESC)")
            db.execute("CREATE INDEX IF NOT EXISTS history_bookmarked ON history(bookmarked, time DESC)")

    def _open_conn(self):
        db = sqlite3.connect(self.db, timeout=5)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA busy_timeout=5000")
        db.execute("PRAGMA synchronous=NORMAL")
        db.execute("PRAGMA temp_store=MEMORY")
        db.create_function("casefold", 1, lambda value: str(value or "").casefold(), deterministic=True)
        return db

    def close(self):
        with self._conns_lock:
            conns, self._conns = self._conns, []
        self._local = threading.local()
        for db in conns:
            try:
                db.close()
            except sqlite3.Error:
                pass

    @contextmanager
    def connect(self):
        if self._pool:
            db = getattr(self._local, "conn", None)
            if db is None:
                db = self._open_conn()
                self._local.conn = db
                with self._conns_lock:
                    self._conns.append(db)
            try:
                with db:
                    yield db
            except sqlite3.ProgrammingError:
                self._local.conn = None
                raise
            return
        db = self._open_conn()
        try:
            with db:
                yield db
        finally:
            db.close()

    @staticmethod
    def key(key):
        if not USERDATA_KEYS.fullmatch(key):
            raise ValueError("Invalid preference key")
        return key

    def get_userdata(self, key):
        with self.connect() as db:
            row = db.execute("SELECT value FROM userdata WHERE key=?", (self.key(key),)).fetchone()
        return json.loads(row[0]) if row else None

    def set_userdata(self, key, value):
        value = json.dumps(value, ensure_ascii=False, allow_nan=False)
        if len(value.encode("utf-8")) > 2 * 1024 * 1024:
            raise ValueError("Preference is too large")
        with self.lock, self.connect() as db:
            db.execute("INSERT OR REPLACE INTO userdata VALUES (?,?)", (self.key(key), value))

    @staticmethod
    def entry(row):
        keys = row.keys()
        replayable = bool(row["replayable"]) if "replayable" in keys else bool(row["params"])
        return {**{key: row[key] for key in ("id", "job", "time", "tab", "infotext", "status",
                 "priority", "bookmarked", "name", "checkpoint", "vae", "error", "queued")},
                "replayable": replayable, "images": json.loads(row["images"])}

    def list_history(self, offset=0, limit=200, query="", tab="", status=""):
        clauses, args = ["status NOT IN ('pending', 'running')"], []
        if status == "bookmarked":
            clauses.append("bookmarked=1")
        elif status:
            clauses.append("status=?")
            args.append(status)
        if tab:
            clauses.append("tab=?")
            args.append(tab)
        for word in query.split()[:20]:
            clauses.append("instr(casefold(infotext),casefold(?))>0")
            args.append(word)
        where = " WHERE " + " AND ".join(clauses) if clauses else ""
        with self.connect() as db:
            total = db.execute("SELECT count(*) FROM history" + where, args).fetchone()[0]
            rows = db.execute(f"SELECT {_ENTRY_COLS} FROM history" + where + " ORDER BY time DESC,rowid DESC LIMIT ? OFFSET ?", [*args, max(1, min(limit, 200)), max(0, offset)]).fetchall()
        return {"total": total, "items": [self.entry(row) for row in rows]}

    def thumb_path(self, name):
        if not THUMB_NAME.fullmatch(name):
            return None
        path = self.thumbs / name
        return path if path.is_file() else None

    def save_thumb(self, entry_id, index, value):
        match = re.fullmatch(r"data:image/(webp|jpeg|png);base64,([A-Za-z0-9+/=]+)", value)
        if not match or len(match[2]) > 550_000:
            return None
        try:
            raw = base64.b64decode(match[2], validate=True)
        except ValueError:
            return None
        if len(raw) > 400 * 1024:
            return None
        name = f"{entry_id}_{index}." + {"jpeg": "jpg"}.get(match[1], match[1])
        self.thumbs.mkdir(parents=True, exist_ok=True)
        (self.thumbs / name).write_bytes(raw)
        return name

    def add_history(self, payload):
        if not isinstance(payload, dict):
            raise ValueError("History entry must be an object")
        text = str(payload.get("infotext") or "")[:20000]
        if not text.strip():
            raise ValueError("Empty generation parameters")
        stamp = float(payload.get("time") or time.time() * 1000)
        if not math.isfinite(stamp):
            raise ValueError("Invalid timestamp")
        job = str(payload.get("job") or "")[:200] or None
        tab = str(payload.get("tab") or "txt2img")
        if tab not in ("txt2img", "img2img"):
            raise ValueError("Invalid generation tab")
        if job:
            with self.connect() as db:
                previous = db.execute(f"SELECT {_ENTRY_COLS} FROM history WHERE job=?", (job,)).fetchone()
                if previous:
                    return self.entry(previous)
        entry_id = uuid.uuid4().hex
        images = []
        for index, image in enumerate((payload.get("images") or [])[:16]):
            if isinstance(image, dict):
                images.append({"url": str(image.get("url") or "")[:2000], "thumb": self.save_thumb(entry_id, index, str(image.get("thumb") or ""))})
        images_json = json.dumps(images)
        with self.lock, self.connect() as db:
            if job:
                previous = db.execute(f"SELECT {_ENTRY_COLS} FROM history WHERE job=?", (job,)).fetchone()
                if previous:
                    self.remove_thumbs([{"id": entry_id, "images": images_json}])
                    return self.entry(previous)
            db.execute("INSERT INTO history(id,time,tab,infotext,images,job) VALUES (?,?,?,?,?,?)",
                       (entry_id, stamp, tab, text, images_json, job))
            old = self.prune_history(db)
            row = db.execute(f"SELECT {_ENTRY_COLS} FROM history WHERE id=?", (entry_id,)).fetchone()
        self.remove_thumbs(old)
        return self.entry(row) if row else {"id": entry_id, "time": stamp, "tab": tab, "infotext": text, "images": images}

    @staticmethod
    def prune_history(db):
        old = db.execute("""SELECT id, images FROM history WHERE bookmarked=0 AND status NOT IN ('pending','running')
                         ORDER BY time DESC,rowid DESC LIMIT -1 OFFSET ?""", (HISTORY_LIMIT,)).fetchall()
        if old:
            db.executemany("DELETE FROM history WHERE id=?", [(row["id"],) for row in old])
        return old

    def save_thumb_from_file(self, entry_id, index, path):
        from PIL import Image, ImageOps
        try:
            name = f"{entry_id}_{index}.webp"
            with Image.open(path) as source:
                image = ImageOps.exif_transpose(source)
                image.thumbnail((256, 256))
                self.thumbs.mkdir(parents=True, exist_ok=True)
                image.convert("RGB").save(self.thumbs / name, "WEBP", quality=82)
            return name
        except (OSError, ValueError, Image.DecompressionBombError):
            return None

    def remove_thumbs(self, rows):
        for row in rows:
            for image in json.loads(row["images"]):
                path = self.thumb_path(str(image.get("thumb") or ""))
                if path:
                    path.unlink(missing_ok=True)
                url = str(image.get("url") or "")
                match = re.fullmatch(r"/lobe/history/images/([0-9a-f]{32}_\d{1,2}\.png)", url)
                if match and match[1].startswith(f'{row["id"]}_'):
                    (self.folder / "history" / "images" / match[1]).unlink(missing_ok=True)

    def delete_history(self, entry_id):
        with self.lock, self.connect() as db:
            rows = db.execute("SELECT id, images FROM history WHERE id=? AND status NOT IN ('pending','running')", (entry_id,)).fetchall()
            if rows:
                db.executemany("DELETE FROM history WHERE id=?", [(row["id"],) for row in rows])
        self.remove_thumbs(rows)
        return len(rows)

    def clear_history(self):
        with self.lock, self.connect() as db:
            rows = db.execute("SELECT id, images FROM history WHERE bookmarked=0 AND status NOT IN ('pending','running')").fetchall()
            if rows:
                db.executemany("DELETE FROM history WHERE id=?", [(row["id"],) for row in rows])
        self.remove_thumbs(rows)
        return len(rows)
