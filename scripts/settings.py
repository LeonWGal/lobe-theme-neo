from fastapi import FastAPI

import modules.scripts as scripts
import os
from typing import Any

from modules import shared
from modules import script_callbacks

from scripts.lib.lobe_log import LobeLog
from scripts.lib.api import LobeApi
from scripts.lib.config import LobeConfig
from scripts.lib.package import LobePackage
from scripts.lib.prompt import LobePrompt
from scripts.lib.locale import LobeLocale
from scripts.lib.network_dirs import install_model_directory_filters
from scripts.lib.safetensors_compat import apply_safetensors_pread

apply_safetensors_pread(bool(LobeConfig().config.get("safetensorsPread", True)))

def bundled_autocomplete_active():
    from modules import extensions

    return not any(
        ext.canonical_name in {"sd-webui-tagcomplete-neo", "a1111-sd-webui-tagcomplete"}
        for ext in extensions.active()
    )


def register_autocomplete_settings():
    if bundled_autocomplete_active():
        from scripts.lib.autocomplete import tag_autocomplete_helper

        tag_autocomplete_helper.on_ui_settings()


def init_lobe(_: Any, app: FastAPI, **kwargs):
    LobeLog.info("Initializing...")
    # UI reload rebuilds Forge's native card metadata. Refresh the theme's
    # data provider too, retaining its persisted index across reloads.
    import importlib
    importlib.reload(importlib.import_module("scripts.lib.validation"))
    importlib.reload(importlib.import_module("scripts.lib.loras"))

    package = LobePackage()
    prompt = LobePrompt()
    locale = LobeLocale()
    config = LobeConfig()
    api = LobeApi(config, package, prompt, locale)
    api.create_api_route(app)
    from scripts.lib.queue import api as queue_api
    queue_api.register(app, _)
    if bundled_autocomplete_active():
        from scripts.lib.autocomplete import tag_autocomplete_helper

        tag_autocomplete_helper.api_tac(_, app)


def refresh_autocomplete_embeddings(model):
    if bundled_autocomplete_active():
        from scripts.lib.autocomplete import tag_autocomplete_helper

        tag_autocomplete_helper.get_embeddings(model)



def prepare_queue():
    from scripts.lib.queue.api import prepare
    prepare()


script_callbacks.on_before_ui(install_model_directory_filters)
script_callbacks.on_before_ui(prepare_queue)
script_callbacks.on_ui_settings(register_autocomplete_settings)
script_callbacks.on_app_started(init_lobe)
script_callbacks.on_model_loaded(refresh_autocomplete_embeddings)
