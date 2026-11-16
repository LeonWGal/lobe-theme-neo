"""Memory actions must respect the generation queue and pinned holders."""
import importlib.util
import sys
import threading
import types
import unittest
from pathlib import Path
from unittest.mock import patch, Mock

folder = Path(__file__).parents[1] / "scripts/lib/memory_keeper"
spec = importlib.util.spec_from_file_location("neo_memory_test", folder / "__init__.py", submodule_search_locations=[str(folder)])
package = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = package
spec.loader.exec_module(package)
from neo_memory_test import keeper, sources


class KeeperTests(unittest.TestCase):
    def setUp(self):
        self.action = Mock()
        self.queue = threading.Lock()
        self.state = types.SimpleNamespace(job="", job_count=0)
        shared = types.ModuleType("modules.shared")
        shared.state = self.state
        modules = types.ModuleType("modules")
        modules.shared = shared
        queue_module = types.ModuleType("modules.call_queue")
        queue_module.queue_lock = self.queue
        self.stubs = patch.dict(sys.modules, {"modules": modules, "modules.shared": shared, "modules.call_queue": queue_module})
        self.stubs.start()
        self.holder = {"id": "checkpoint", "name": "Checkpoint", "category": "sd", "unload": self.action, "usage": lambda: {"ram": 100, "vram": 100}}
        self.patches = [patch.object(keeper, "_holders", return_value=[self.holder]), patch.object(keeper, "_snapshot", return_value={"ram": 0, "vram": 0}), patch.object(keeper, "cleanup"), patch.object(keeper, "status", return_value={}), patch.object(keeper, "pins", return_value=set())]
        for item in self.patches:
            item.start()

    def tearDown(self):
        for item in reversed(self.patches):
            item.stop()
        self.stubs.stop()

    def test_generation_blocks_single_and_bulk_unload(self):
        self.state.job = "txt2img"
        for action in (lambda: keeper.act("checkpoint", "unload"), lambda: keeper.free("all")):
            with self.assertRaises(keeper.Busy):
                action()
        self.action.assert_not_called()

    def test_model_load_lock_blocks_actions(self):
        self.queue.acquire()
        with self.assertRaises(keeper.Busy):
            keeper.free("all")
        self.queue.release()
        self.action.assert_not_called()

    def test_pin_protects_bulk_free_and_idle_action_releases_queue(self):
        with patch.object(keeper, "pins", return_value={"checkpoint"}):
            keeper.free("all")
        self.action.assert_not_called()
        keeper.act("checkpoint", "unload")
        self.action.assert_called_once()
        self.assertFalse(self.queue.locked())

    def test_model_inspection_never_uses_lazy_shared_sd_model(self):
        sd_models = types.ModuleType("modules.sd_models")
        model = object()
        sd_models.model_data = types.SimpleNamespace(sd_model=model)
        with patch.dict(sys.modules, {"modules.sd_models": sd_models}):
            self.assertIs(sources._sd_model(), model)


if __name__ == "__main__":
    unittest.main()
