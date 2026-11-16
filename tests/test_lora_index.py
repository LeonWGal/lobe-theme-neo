import importlib.util
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

log = types.ModuleType("scripts.lib.lobe_log")
log.LobeLog = types.SimpleNamespace(debug=lambda *_: None)
with patch.dict(sys.modules, {"scripts.lib.lobe_log": log}):
    spec = importlib.util.spec_from_file_location("neo_lora_index_test", Path(__file__).parents[1] / "scripts/lib/loras.py")
    index = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(index)


class IndexTests(unittest.TestCase):
    def test_compatibility_follows_selected_checkpoint_before_it_is_loaded(self):
        selected = types.SimpleNamespace(filename="new.safetensors", metadata={"modelspec.architecture":"sdxl"})
        model = type("StableDiffusion", (), {"sd_checkpoint_info":types.SimpleNamespace(filename="old.safetensors")})()
        modules = types.ModuleType("modules")
        modules.sd_models = types.SimpleNamespace(model_data=types.SimpleNamespace(sd_model=model), get_closet_checkpoint_match=lambda _:selected)
        modules.shared = types.SimpleNamespace(opts=types.SimpleNamespace(sd_model_checkpoint="new.safetensors"))
        with patch.dict(sys.modules, {"modules":modules}):
            self.assertEqual(index.current_model()["arch"], "xl")

    def test_native_metadata_is_reused_and_persisted_cache_survives_restart(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as folder:
            model = Path(folder) / "model.safetensors"
            model.write_bytes(b"fixture")
            network = types.SimpleNamespace(filename=str(model), metadata={"ss_base_model_version": "sdxl"}, get_alias=lambda: "alias")
            networks = types.ModuleType("networks")
            networks.available_networks = {"model": network}
            native = types.SimpleNamespace(name="lora", items={"model": {"user_metadata": {"activation text": "ceramic, vase", "sd version": "xl"}}})
            modules = types.ModuleType("modules")
            modules.ui_extra_networks = types.SimpleNamespace(extra_pages=[native])
            with patch.dict(sys.modules, {"networks": networks, "modules": modules}), patch.object(index, "_cache_path", Path(folder) / "index.json"), patch.object(index, "_read_header", side_effect=AssertionError("unnecessary header read")):
                index._cache.clear()
                index._cache_loaded = False
                first = index.list_loras()
                self.assertEqual(first[0]["triggerWords"], ["ceramic", "vase"])
                self.assertEqual(first[0]["arch"], "xl")
                index._cache.clear()
                index._cache_loaded = False
                with patch.object(index, "_trigger_words", side_effect=AssertionError("unnecessary sidecar scan")):
                    self.assertEqual(index.list_loras(), first)
                native.items["model"]["user_metadata"]["activation text"] = "updated"
                self.assertEqual(index.list_loras()[0]["triggerWords"], ["updated"])


if __name__ == "__main__":
    unittest.main()
