import importlib.util
from pathlib import Path
import tempfile
import types
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("network_dirs", ROOT / "scripts/lib/network_dirs.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ModelDirectoryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(dir=ROOT / "tests")
        self.root = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def page(self, filenames):
        return types.SimpleNamespace(
            allowed_directories_for_previews=lambda: [str(self.root)],
            items={str(i): {"filename": str(path)} for i, path in enumerate(filenames)},
        )

    def test_indexes_models_and_ancestors_without_walking_disk(self):
        page = self.page([self.root / "portraits" / "xl" / "one.safetensors",
                          self.root / "portraits" / "xl" / "two.safetensors",
                          self.root / "code" / "node_modules" / ".." / ".." / "root.safetensors"])
        with patch("os.walk", side_effect=AssertionError("full disk scan")):
            paths = module.model_directories(page)
        self.assertEqual(paths, {str(Path("portraits")) + module.os.path.sep,
                                 str(Path("portraits/xl")) + module.os.path.sep})

    def test_ignores_outside_roots_and_preserves_hidden_directory_preference(self):
        page = self.page([self.root / ".hidden" / "one.pt", self.root.parent / "outside" / "model.pt"])
        self.assertEqual(module.model_directories(page), set())
        self.assertEqual(module.model_directories(page, hidden=True), {".hidden" + module.os.path.sep})

    def test_empty_initial_pages_do_no_directory_work(self):
        page = self.page([])
        with patch("os.walk", side_effect=AssertionError("full disk scan")):
            self.assertEqual(module.model_directories(page), set())


if __name__ == "__main__":
    unittest.main()
