import json
from pathlib import Path

from fastapi import FastAPI, Response, Request

from scripts.lib.config import LobeConfig
from scripts.lib.package import LobePackage
from scripts.lib.prompt import LobePrompt
from scripts.lib.locale import LobeLocale
from scripts.lib.lobe_log import LobeLog

class LobeApi:
    def __init__(self, config: LobeConfig, package: LobePackage, prompt:LobePrompt, locale: LobeLocale):
        self.package = package
        self.prompt = prompt
        self.config = config
        self.locale = locale
        pass

    def create_api_route(self, app: FastAPI):
        from scripts.lib.tools_api import register
        register(app)

        @app.get("/lobe/native-locales")
        async def native_locales():
            from modules import extensions, localization, shared
            localization.list_localizations(shared.cmd_opts.localizations_dir)
            managed = any(ext.canonical_name == "sd-webui-language-diffusion" for ext in extensions.active())
            return {
                "active": shared.opts.localization,
                "options": ["None", *sorted(localization.localizations)],
                "managedByLanguageDiffusion": managed,
            }

        @app.post("/lobe/native-locales")
        async def set_native_locale(request: Request):
            from modules import localization, shared
            from fastapi import HTTPException
            data = await request.json()
            language = data.get("language") if isinstance(data, dict) else None
            localization.list_localizations(shared.cmd_opts.localizations_dir)
            if not isinstance(language, str) or language not in ("None", *localization.localizations):
                raise HTTPException(400, "Unknown WebUI language")
            previous = shared.opts.localization
            if language == previous:
                return {"active": language}
            try:
                if not shared.opts.set("localization", language, is_api=True):
                    raise HTTPException(409, "WebUI localization setting is locked")
                shared.opts.save(shared.config_filename)
            except (OSError, AssertionError):
                shared.opts.data["localization"] = previous
                raise HTTPException(409, "Could not save WebUI localization")
            return {"active": language}

        @app.get("/lobe/package")
        async def lobe_package_get():
            LobeLog.debug("lobe_package_get")

            if self.package.is_empty():
                return Response(content=self.package.json(), media_type="application/json", status_code=404)
            return Response(content=self.package.json(), media_type="application/json", status_code=200)

        @app.get("/lobe/prompt")
        async def lobe_prompt_get():
            LobeLog.debug("lobe_prompt_get")

            if self.prompt.is_empty():
                return Response(content=self.prompt.json(), media_type="application/json", status_code=404)
            return Response(content=self.prompt.json(), media_type="application/json", status_code=200)

        @app.get("/lobe/locales/{lng}")
        async def lobe_locale_get(lng: str):
            LobeLog.debug(f"lobe_locale_get: {lng}")

            language_data = self.locale.get_language_file(lng)

            if language_data is None:
                return Response(
                    content=json.dumps({"error": "Language file not found"}),
                    media_type="application/json",
                    status_code=404,
                )

            return Response(content=json.dumps(language_data), media_type="application/json", status_code=200)

        @app.get("/lobe/config")
        async def lobe_config_get():
            LobeLog.debug("lobe_config_get")

            if self.config.is_empty():
                return Response(content=self.config.json(), media_type="application/json", status_code=404)
            return Response(content=self.config.json(), media_type="application/json", status_code=200)

        @app.post("/lobe/config")
        async def lobe_config_save(request: Request):
            LobeLog.debug("lobe_config_save")

            try:
                data = await request.json()
                self.config.save(data)
                from scripts.lib.safetensors_compat import apply_safetensors_pread
                apply_safetensors_pread(bool(self.config.config.get("safetensorsPread", True)))
            except (ValueError, TypeError):
                return Response(content=json.dumps({"error": "Invalid settings"}),
                                media_type="application/json", status_code=400)
            except OSError:
                return Response(content=json.dumps({"error": "Failed to save settings"}),
                                media_type="application/json", status_code=500)
            return Response(
                content=json.dumps({"message": "Config saved successfully"}),
                media_type="application/json", status_code=200
            )

        @app.delete("/lobe/config")
        async def lobe_config_delete():
            LobeLog.debug("lobe_config_delete")

            self.config.delete()
            return Response(
                content=json.dumps({"message": "Config deleted successfully"}),
                media_type="application/json", status_code=200
            )
