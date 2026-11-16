import importlib.util
import tempfile
import unittest
from pathlib import Path

spec=importlib.util.spec_from_file_location("theme_store",Path(__file__).parents[1]/"scripts/lib/store.py")
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class StoreTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(dir=Path(__file__).parent)
        self.store=module.LobeStore(self.temp.name)
    def tearDown(self):
        self.temp.cleanup()
    def add(self,job="job-one",text="vase\nSteps: 4, Seed: 12"):
        return self.store.add_history({"job":job,"infotext":text,"tab":"txt2img","images":[],"time":1000})
    def test_restart_and_deduplication(self):
        first=self.add();self.add()
        reopened=module.LobeStore(self.temp.name)
        self.assertEqual(reopened.list_history()["total"],1)
        self.assertEqual(reopened.list_history()["items"][0]["id"],first["id"])
    def test_search_and_bounded_history(self):
        limit=module.HISTORY_LIMIT;module.HISTORY_LIMIT=2
        try:
            self.add("a","cat");self.add("b","vase");self.add("c","portrait")
            self.assertEqual(self.store.list_history()["total"],2)
            self.assertEqual(self.store.list_history(query="portrait")["total"],1)
        finally:module.HISTORY_LIMIT=limit
    def test_preferences_and_path_validation(self):
        self.store.set_userdata("loraFavorites",["model"])
        self.assertEqual(self.store.get_userdata("loraFavorites"),["model"])
        self.assertIsNone(self.store.thumb_path("../../outputs/picture.png"))
        with self.assertRaises(ValueError):self.store.set_userdata("../config",{})
    def test_clear_never_deletes_outputs(self):
        output=Path(self.temp.name)/"outputs.png";output.write_bytes(b"output")
        self.add();self.store.clear_history()
        self.assertTrue(output.exists());self.assertEqual(self.store.list_history()["total"],0)
    def test_unicode_search(self):
        self.add(text="Синий кувшин\nSteps: 4")
        self.assertEqual(self.store.list_history(query="синий КУВШИН")["total"],1)

if __name__=="__main__":unittest.main()
