import json
import os
from pathlib import Path

from scripts.lib.lobe_log import LobeLog
from scripts.lib.validation import SCHEMA

EXTENSION_FOLDER = Path(__file__).parent.parent.parent

class LobeLocale:
    def __init__(self):
        pass

    def load_language_file(self, lng: str):
        if lng not in (*SCHEMA["i18n"]["enum"], "options"):
            return None
        locale_folder = (EXTENSION_FOLDER / "locales").resolve()
        file_path = (locale_folder / f"{lng}.json").resolve()
        if file_path.parent != locale_folder:
            return None

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                language_data = json.load(f)
                return language_data
        except (OSError, ValueError):
            return None

    def get_language_file(self, lng: str):
        language_data = self.load_language_file(lng)

        if language_data:
            return language_data
        else:
            LobeLog.debug(f"Language file not found: {lng}")
            return None

    @staticmethod
    def default():
        return {'empty': True}
