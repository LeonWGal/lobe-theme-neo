"""Regression tests for the file-backed API, without starting Forge."""
import argparse
import importlib.util
import json
from pathlib import Path
import sys
import os
import tempfile
import types
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
log = types.ModuleType("scripts.lib.lobe_log")
log.LobeLog = type("LobeLog", (), {"debug": staticmethod(lambda *args: None)})
sys.modules["scripts.lib.lobe_log"] = log


def load_module(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / "lib" / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_preload():
    spec = importlib.util.spec_from_file_location("lobe_preload", ROOT / "preload.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class ProxyStartupTests(unittest.TestCase):
    def run_preload(self, environment, proxies):
        module = load_preload()
        with patch.dict(os.environ, environment, clear=True), \
                patch("urllib.request.getproxies", return_value=proxies):
            parser = argparse.ArgumentParser()
            module.preload(parser)
            result = dict(os.environ)
            self.assertTrue(parser.parse_args(["--lobe-debug"]).lobe_debug)
            module.preload(argparse.ArgumentParser())
            self.assertEqual(dict(os.environ), result)
            return result

    def test_system_proxy_is_preserved_with_loopback_bypass(self):
        result = self.run_preload({}, {
            "http": "http://127.0.0.1:10809",
            "https": "http://127.0.0.1:10809",
        })
        self.assertEqual(result["HTTP_PROXY"], "http://127.0.0.1:10809")
        self.assertEqual(result["HTTPS_PROXY"], "http://127.0.0.1:10809")
        self.assertEqual(set(result["NO_PROXY"].split(",")), {"localhost", "127.0.0.1", "::1"})

    def test_existing_proxy_and_bypass_settings_are_preserved(self):
        result = self.run_preload({
            "HTTPS_PROXY": "http://custom:8080",
            "NO_PROXY": "internal.example,127.0.0.1",
        }, {"https": "http://custom:8080", "no": "internal.example,127.0.0.1"})
        self.assertEqual(result["HTTPS_PROXY"], "http://custom:8080")
        self.assertEqual(result["NO_PROXY"], "internal.example,127.0.0.1,localhost,::1")

    def test_lowercase_proxy_keys_are_supported(self):
        result = self.run_preload({"no_proxy": "internal.example"}, {"no": "internal.example"})
        self.assertIn("localhost", result.get("no_proxy", result.get("NO_PROXY", "")))
        self.assertIn("internal.example", result.get("no_proxy", result.get("NO_PROXY", "")))

    def test_global_bypass_remains_unchanged(self):
        result = self.run_preload({"NO_PROXY": "*"}, {"no": "*"})
        self.assertEqual(result, {"NO_PROXY": "*"})

    def test_no_proxy_server_is_invented(self):
        result = self.run_preload({}, {})
        self.assertNotIn("HTTP_PROXY", result)
        self.assertIn("localhost", result["NO_PROXY"])


class BackendTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="lobe-test-", dir=ROOT / "tests")
        self.folder = Path(self.temp.name)
        self.assertTrue(self.folder.resolve().is_relative_to((ROOT / "tests").resolve()))

    def tearDown(self):
        self.temp.cleanup()

    def test_locale_cannot_escape_locale_directory(self):
        locale = load_module("locale")
        (self.folder / "locales").mkdir()
        (self.folder / "secret.json").write_text('{"secret": true}', encoding="utf-8")
        locale.EXTENSION_FOLDER = self.folder
        self.assertIsNone(locale.LobeLocale().get_language_file("..\\secret"))
        self.assertIsNone(locale.LobeLocale().get_language_file("../secret"))

    def test_invalid_json_shape_uses_defaults(self):
        config = load_module("config")
        path = self.folder / "config.json"
        path.write_text("null", encoding="utf-8")
        config.CONFIG_FILENAME = path
        cfg = config.LobeConfig()
        self.assertTrue(cfg.is_empty())

    def test_failed_write_does_not_change_in_memory_config(self):
        config = load_module("config")
        config.CONFIG_FILENAME = self.folder / "config.json"
        cfg = config.LobeConfig()
        cfg.save({"enableSidebar": True})
        with patch.object(config.os, "replace", side_effect=OSError("disk unavailable")):
            with self.assertRaises(OSError):
                cfg.save({"enableSidebar": False})
        self.assertEqual(json.loads(cfg.json()), {"enableSidebar": True})

    def test_settings_validation_rejects_invalid_known_fields(self):
        from scripts.lib.validation import validate_settings
        for data in [{"primaryColor": "invalid"}, {"sidebarWidth": -1},
                     {"enableSidebar": "false"}, {"schemaVersion": True},
                     {"setting": []}, []]:
            with self.subTest(data=data), self.assertRaises(ValueError):
                validate_settings(data)

    def test_valid_settings_and_export_wrapper_are_supported(self):
        from scripts.lib.validation import validate_settings
        expected = {"primaryColor": "indigo", "sidebarWidth": 280}
        self.assertEqual(validate_settings(expected), expected)
        self.assertEqual(validate_settings({"schemaVersion": 1, "setting": expected}), expected)

    def test_locale_whitelist_allows_supported_languages(self):
        locale = load_module("locale")
        (self.folder / "locales").mkdir()
        (self.folder / "locales" / "ru_RU.json").write_text('{"cancel": "Отмена"}', encoding="utf-8")
        locale.EXTENSION_FOLDER = self.folder
        self.assertEqual(locale.LobeLocale().get_language_file("ru_RU"), {"cancel": "Отмена"})


if __name__ == "__main__":
    unittest.main()
