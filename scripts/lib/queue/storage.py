import json
import sqlite3
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

from scripts.lib.store import LobeStore, _ENTRY_COLS

TERMINAL = ("done", "failed", "interrupted")


class QueueStore(LobeStore):
    def has_pending(self):
        with self.connect() as db:
            return db.execute("SELECT 1 FROM history WHERE status='pending' LIMIT 1").fetchone() is not None
    def insert(self, db, tab, params, scripts=None, *, job=None, status="pending", name=None,
               checkpoint=None, vae=None, priority=None, stamp=None, bookmarked=False,
               infotext="", images=None, error=None, result=None, entry_id=None, queued=True):
        entry_id = entry_id or uuid.uuid4().hex
        stamp = time.time() * 1000 if stamp is None else stamp
        if priority is None:
            priority = db.execute("SELECT coalesce(max(priority),0)+1 FROM history WHERE status='pending'").fetchone()[0]
        db.execute("""INSERT OR IGNORE INTO history
            (id,job,time,tab,status,priority,bookmarked,name,checkpoint,vae,params,script_params,infotext,images,error,result,queued)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                   (entry_id, job or f"task({entry_id})", stamp, tab, status, priority, int(bookmarked),
                    name, checkpoint, vae, json.dumps(params, ensure_ascii=False, allow_nan=False) if params else None,
                    scripts, infotext, json.dumps(images or []), error, result, int(queued)))
        return entry_id

    def get(self, entry_id):
        with self.connect() as db:
            return db.execute("SELECT * FROM history WHERE id=? OR job=?", (entry_id, entry_id)).fetchone()

    def list_queue(self):
        with self.connect() as db:
            rows = db.execute(f"""SELECT {_ENTRY_COLS} FROM history WHERE queued=1 AND status IN ('pending','running')
                ORDER BY status='running' DESC, priority, rowid""").fetchall()
        return [self.entry(row) for row in rows]

    def claim(self):
        with self.lock, self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute("SELECT * FROM history WHERE status='pending' ORDER BY priority,rowid LIMIT 1").fetchone()
            if row:
                db.execute("UPDATE history SET status='running',error=NULL WHERE id=?", (row["id"],))
            return row

    def recover(self):
        with self.lock, self.connect() as db:
            db.execute("UPDATE history SET status='interrupted',error=? WHERE status='running'",
                       ("WebUI stopped before this generation finished.",))

    def take_completion_action(self):
        with self.lock, self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            if db.execute("SELECT 1 FROM history WHERE status IN ('pending','running') LIMIT 1").fetchone():
                return None
            row = db.execute("SELECT value FROM userdata WHERE key='queueCompletion'").fetchone()
            action = json.loads(row[0]) if row else None
            if action and action != "none":
                db.execute("DELETE FROM userdata WHERE key='queueCompletion'")
                return action
            return None

    def finish(self, entry_id, status, paths=(), infotext="", error=None):
        paths = list(paths)
        images = self.images_for(entry_id, paths)
        with self.lock, self.connect() as db:
            db.execute("""UPDATE history SET status=?,time=?,images=?,error=?,result=?,
                       infotext=coalesce(nullif(?,''),infotext) WHERE id=? AND status='running'""",
                       (status, time.time() * 1000, json.dumps(images), error, json.dumps(paths), infotext, entry_id))
            old = self.prune_history(db)
        self.remove_thumbs(old)

    def images_for(self, entry_id, paths):
        images = []
        for path in dict.fromkeys(str(p) for p in paths if p):
            target = Path(path)
            if not target.is_file():
                continue
            owned = target.resolve().parent == (self.folder / "history" / "images").resolve()
            url = "/lobe/history/images/" + target.name if owned else "/file=" + quote(target.resolve().as_posix(), safe="/:")
            images.append({"url": url,
                           "thumb": self.save_thumb_from_file(entry_id, len(images), target)})
            if len(images) == 16:
                break
        return images

    def patch_task(self, entry_id, changes):
        with self.lock, self.connect() as db:
            for field in ("bookmarked", "name"):
                if field in changes:
                    value = int(changes[field]) if field == "bookmarked" else changes[field]
                    db.execute(f"UPDATE history SET {field}=? WHERE id=?", (value, entry_id))
            for field in ("checkpoint", "vae"):
                if field in changes:
                    db.execute(f"UPDATE history SET {field}=? WHERE id=? AND status='pending'",
                               (changes[field], entry_id))
            row = db.execute(f"SELECT {_ENTRY_COLS} FROM history WHERE id=?", (entry_id,)).fetchone()
            return self.entry(row) if row else None

    def prioritize(self, entry_id):
        with self.lock, self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            priority = db.execute("SELECT coalesce(min(priority),0)-1 FROM history WHERE status='pending'").fetchone()[0]
            return db.execute("UPDATE history SET priority=? WHERE id=? AND status='pending'", (priority, entry_id)).rowcount

    def move_task(self, entry_id, direction):
        with self.lock, self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            ids = [row[0] for row in db.execute("SELECT id FROM history WHERE status='pending' ORDER BY priority,rowid")]
            if entry_id not in ids:
                return False
            index = ids.index(entry_id)
            destination = index + direction
            if not 0 <= destination < len(ids):
                return False
            ids[index], ids[destination] = ids[destination], ids[index]
            db.executemany("UPDATE history SET priority=? WHERE id=?", enumerate(ids, 1))
            return True

    def cancel_pending(self, entry_id=None):
        with self.lock, self.connect() as db:
            clause, args = (" AND id=?", (entry_id,)) if entry_id else ("", ())
            return db.execute("DELETE FROM history WHERE status='pending'" + clause, args).rowcount

    def requeue(self, entry_id=None):
        with self.lock, self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            condition, args = ("id=? AND status IN ('done','failed','interrupted')", (entry_id,)) if entry_id else ("status='failed'", ())
            rows = db.execute(f"SELECT * FROM history WHERE params IS NOT NULL AND {condition} ORDER BY time", args).fetchall()
            return [self.insert(db, row["tab"], json.loads(row["params"]), row["script_params"],
                                name=row["name"], checkpoint=row["checkpoint"], vae=row["vae"],
                                infotext=row["infotext"]) for row in rows]

    def migrate(self, source):
        source = Path(source)
        if not source.is_file() or self.get_userdata("queueMigrationV1"):
            return
        try:
            legacy = sqlite3.connect(source.resolve().as_uri() + "?mode=ro", uri=True)
        except sqlite3.Error:
            legacy = sqlite3.connect(str(source))
        legacy.row_factory = sqlite3.Row
        try:
            rows = legacy.execute("SELECT * FROM task ORDER BY priority").fetchall()
            has_state = legacy.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='app_state'").fetchone()
            state = legacy.execute("SELECT value FROM app_state WHERE key='queue_state'").fetchone() if has_state else None
        finally:
            legacy.close()
        with self.lock, self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            if db.execute("SELECT 1 FROM userdata WHERE key='queueMigrationV1'").fetchone():
                return
            for raw in rows:
                try:
                    row = dict(raw)
                    tab = row.get("type")
                    if tab not in ("txt2img", "img2img"):
                        continue
                    params = json.loads(row["params"]) if row.get("params") else {}
                    if not isinstance(params, dict):
                        continue
                    status = row.get("status") or "done"
                    result = row.get("result")
                    try:
                        data = json.loads(result) if result and status == "done" else {}
                    except (ValueError, TypeError):
                        data = {}
                    if not isinstance(data, dict):
                        data = {}
                    job = str(row.get("id") or uuid.uuid4().hex)
                    existing = db.execute("SELECT id,images FROM history WHERE job=? OR id=?", (job, job)).fetchone()
                    entry_id = existing["id"] if existing else uuid.uuid5(uuid.NAMESPACE_URL, "agent-scheduler:" + job).hex
                    paths = data.get("images") if isinstance(data.get("images"), list) else []
                    geninfo = data.get("geninfo") if isinstance(data.get("geninfo"), dict) else {}
                    info = geninfo.get("infotexts") if isinstance(geninfo.get("infotexts"), list) else []
                    args_dict = params.get("args") if isinstance(params.get("args"), dict) else {}
                    prompt = args_dict.get("prompt") or ""
                    try:
                        updated = datetime.fromisoformat(str(row.get("updated_at") or ""))
                        stamp = (updated if updated.tzinfo else updated.replace(tzinfo=timezone.utc)).timestamp() * 1000
                    except ValueError:
                        stamp = time.time() * 1000
                    images = self.images_for(entry_id, paths) if not existing or existing["images"] == "[]" else []
                    fields = (row.get("name"), int(bool(row.get("bookmarked"))), params.get("checkpoint"),
                              params.get("vae"), row.get("params"), row.get("script_params"))
                    if existing:
                        db.execute("""UPDATE history SET name=?,bookmarked=?,checkpoint=?,vae=?,params=?,script_params=?,
                            images=CASE WHEN images='[]' THEN ? ELSE images END
                            WHERE id=?""", (*fields, json.dumps(images), entry_id))
                        continue
                    self.insert(db, tab, params, row.get("script_params"), entry_id=entry_id, job=job,
                                status="interrupted" if status == "running" else status, priority=row.get("priority", 0),
                                stamp=stamp, name=fields[0], bookmarked=fields[1], checkpoint=fields[2],
                                vae=fields[3], infotext=info[0] if info else str(prompt), images=images,
                                error=str(result) if status == "failed" and result else None)
                except Exception as row_error:
                    print(f"[Lobe queue] Skipping corrupt legacy task row: {row_error}")
            if state and state[0] == "paused":
                db.execute("INSERT OR IGNORE INTO userdata VALUES (?,?)", ("queuePaused", "true"))
            db.execute("INSERT OR REPLACE INTO userdata VALUES (?,?)", ("queueMigrationV1", "true"))
