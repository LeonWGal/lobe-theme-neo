import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path

from scripts.lib.queue.storage import QueueStore


class QueueStorageTest(unittest.TestCase):
    def test_migration_and_resume(self):
        with tempfile.TemporaryDirectory() as folder:
            old = Path(folder) / "old.sqlite3"
            with closing(sqlite3.connect(old)) as db, db:
                db.execute("""CREATE TABLE task (
                    id TEXT, type TEXT, params TEXT, script_params BLOB, status TEXT,
                    priority INTEGER, bookmarked INTEGER, updated_at TEXT, result TEXT)""")
                db.executemany("INSERT INTO task VALUES (?,?,?,?,?,?,?,?,?)", [
                    ("pending-job", "txt2img", '{"args":{"prompt":"queued"}}', b"", "pending", 1, 0, "2026-11-13 00:00:00", None),
                    ("finished-job", "img2img", '{"args":{"prompt":"finished"}}', b"", "done", 2, 1, "2026-11-13 00:00:00", json.dumps({"images": []})),
                ])
            store = QueueStore(Path(folder) / "lobe")
            store.migrate(old)
            store.migrate(old)
            self.assertEqual(store.list_history(status="bookmarked")["total"], 1)
            self.assertEqual(store.clear_history(), 0)
            waiting = store.claim()
            self.assertEqual(waiting["job"], "pending-job")
            self.assertEqual(store.cancel_pending(), 0)
            store.recover()
            self.assertEqual(store.get(waiting["id"])["status"], "interrupted")
            clone, = store.requeue(waiting["id"])
            self.assertEqual(store.claim()["id"], clone)
            store.finish(clone, "failed", error="test failure")
            self.assertEqual(len(store.requeue()), 1)


if __name__ == "__main__":
    unittest.main()
