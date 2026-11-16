from modules import scripts


class LobeAspectRatioScript(scripts.Script):
    def title(self):
        return "Lobe Theme Aspect Ratio"

    def show(self, is_img2img):
        return scripts.AlwaysVisible
