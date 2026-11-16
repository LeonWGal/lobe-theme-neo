import sqlite3
import threading
from contextlib import contextmanager
from pathlib import Path

from .shared_paths import DATA_PATH

db_file = DATA_PATH / "tag_frequency.db"
timeout = 30
db_ver = 1
_thread_local = threading.local()
_wal_ready = False
_wal_lock = threading.Lock()


def _open_freq_conn(db):
    Path(db).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db, timeout=timeout)
    conn.isolation_level = None
    conn.execute("PRAGMA busy_timeout=5000")
    conn.execute("PRAGMA temp_store=MEMORY")
    return conn


@contextmanager
def transaction(db=None, readonly=False):
    """Context manager for database transactions, reusing the default DB connection per thread."""
    global _wal_ready
    target_db = db_file if db is None else db
    reuse = target_db == db_file
    conn = None  # guard against NameError in finally if connect() itself raises (#288)
    started = False
    try:
        if reuse:
            conn = getattr(_thread_local, "conn", None)
            if conn is None:
                conn = _open_freq_conn(target_db)
                with _wal_lock:
                    if not _wal_ready:
                        conn.execute("PRAGMA journal_mode=WAL")
                        conn.execute("PRAGMA synchronous=NORMAL")
                        _wal_ready = True
                _thread_local.conn = conn
        else:
            conn = _open_freq_conn(target_db)
        cursor = conn.cursor()
        if not readonly:
            cursor.execute("BEGIN")
            started = True
        yield cursor
        if started:
            cursor.execute("COMMIT")
            started = False
    except sqlite3.Error as e:
        if conn and started:
            try:
                conn.execute("ROLLBACK")
            except sqlite3.Error:
                pass
        if reuse:
            _thread_local.conn = None
            if conn:
                try:
                    conn.close()
                except sqlite3.Error:
                    pass
                conn = None
        print("Tag Autocomplete: Frequency database error:", e)
    finally:
        if not reuse and conn:
            conn.close()


class TagFrequencyDb:
    """Class containing creation and interaction methods for the tag frequency database"""

    def __init__(self) -> None:
        self.version = self.__check()

    def __check(self):
        if not db_file.exists():
            print("Tag Autocomplete: Creating frequency database")
            with transaction() as cursor:
                self.__create_db(cursor)
                self.__update_db_data(cursor, "version", db_ver)
            print("Tag Autocomplete: Database successfully created")

        return self.__get_version()

    def __create_db(self, cursor: sqlite3.Cursor):
        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS db_data (
            key TEXT PRIMARY KEY,
            value TEXT
        )
        """
        )

        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS tag_frequency (
            name TEXT NOT NULL,
            type INT NOT NULL,
            count_pos INT,
            count_neg INT,
            last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (name, type)
        )
        """
        )

    def __update_db_data(self, cursor: sqlite3.Cursor, key, value):
        cursor.execute(
            """
        INSERT OR REPLACE
        INTO db_data (key, value)
        VALUES (?, ?)
        """,
            (key, value),
        )

    def __get_version(self):
        db_version = None
        with transaction() as cursor:
            cursor.execute(
                """
            SELECT value
            FROM db_data
            WHERE key = 'version'
            """
            )
            db_version = cursor.fetchone()

        return db_version[0] if db_version else 0

    def get_all_tags(self):
        with transaction(readonly=True) as cursor:
            cursor.execute(
                f"""
            SELECT name, type, count_pos, count_neg, last_used
            FROM tag_frequency
            WHERE count_pos > 0 OR count_neg > 0
            ORDER BY count_pos + count_neg DESC
            """
            )
            tags = cursor.fetchall()

        return tags

    def get_tag_count(self, tag, ttype, negative=False):
        count_str = "count_neg" if negative else "count_pos"
        with transaction(readonly=True) as cursor:
            cursor.execute(
                f"""
            SELECT {count_str}, last_used
            FROM tag_frequency
            WHERE name = ? AND type = ?
            """,
                (tag, ttype),
            )
            tag_count = cursor.fetchone()

        if tag_count:
            return tag_count[0], tag_count[1]
        else:
            return 0, None

    def get_tag_counts(self, tags: list[str], ttypes: list[str], negative=False, date_limit=None):
        count_str = "count_neg" if negative else "count_pos"
        pairs = list(zip(tags, ttypes))
        if not pairs:
            return
        unique_names = list(dict.fromkeys(tag for tag, _ in pairs))
        found = {}
        with transaction(readonly=True) as cursor:
            for offset in range(0, len(unique_names), 400):
                chunk = unique_names[offset : offset + 400]
                placeholders = ",".join("?" * len(chunk))
                if date_limit is not None:
                    cursor.execute(
                        f"SELECT name, type, {count_str}, last_used FROM tag_frequency "
                        f"WHERE name IN ({placeholders}) AND last_used > datetime('now', '-' || ? || ' days')",
                        (*chunk, date_limit),
                    )
                else:
                    cursor.execute(
                        f"SELECT name, type, {count_str}, last_used FROM tag_frequency "
                        f"WHERE name IN ({placeholders})",
                        chunk,
                    )
                for r_name, r_type, r_cnt, r_used in cursor.fetchall():
                    found[(r_name, r_type)] = (r_cnt, r_used)
        for tag, ttype in pairs:
            try:
                norm_type = int(ttype) if isinstance(ttype, str) else ttype
            except ValueError:
                norm_type = ttype
            row = found.get((tag, norm_type))
            if row is not None:
                yield (tag, ttype, row[0], row[1])
            else:
                yield (tag, ttype, 0, None)

    def increase_tag_count(self, tag, ttype, negative=False):
        with transaction() as cursor:
            cursor.execute(
                """
                INSERT INTO tag_frequency (name, type, count_pos, count_neg)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(name, type) DO UPDATE SET
                    count_pos = COALESCE(tag_frequency.count_pos, 0) + excluded.count_pos,
                    count_neg = COALESCE(tag_frequency.count_neg, 0) + excluded.count_neg,
                    last_used = CURRENT_TIMESTAMP
                """,
                (tag, ttype, int(not negative), int(negative)),
            )

    def reset_tag_count(self, tag, ttype, positive=True, negative=False):
        if positive and negative:
            set_str = "count_pos = 0, count_neg = 0"
        elif positive:
            set_str = "count_pos = 0"
        elif negative:
            set_str = "count_neg = 0"

        with transaction() as cursor:
            cursor.execute(
                f"""
            UPDATE tag_frequency
            SET {set_str}
            WHERE name = ? AND type = ?
            """,
                (tag, ttype),
            )
