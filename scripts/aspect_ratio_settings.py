import gradio as gr
from modules import scripts, script_callbacks, shared


class LobeAspectRatioScript(scripts.Script):
    def title(self):
        return "Lobe Theme Aspect Ratio"

    def show(self, is_img2img):
        return scripts.AlwaysVisible


def on_ui_settings():
    section = ("lobe_ratio", "Ratio Controls (Lobe Theme)")
    shared.opts.add_option(
        "gal_ratio_default_view",
        shared.OptionInfo(
            "buttons",
            "Режим отображения соотношений сторон по умолчанию",
            gr.Radio,
            {"choices": ["buttons", "dropdown"]},
            section=section,
        ),
    )


script_callbacks.on_ui_settings(on_ui_settings)
