import unittest
from types import SimpleNamespace

from gradio.components import Number, Slider, Textbox

from scripts.lib.queue.runner import LobeTaskRunner


class QueuePreprocessTest(unittest.IsolatedAsyncioTestCase):
    async def test_tag_seeds_use_native_random_default_when_blank(self):
        dependency = SimpleNamespace(inputs=[
            Number(label="Seed for upsampling tags", minimum=-1, value=-1),
            Number(label="Seed for upsampling tags", minimum=-1, value=-1),
            Number(label="Seed", minimum=-1, precision=0),
        ])
        worker = SimpleNamespace(inputs={"txt2img": dependency, "img2img": dependency})
        for tab in worker.inputs:
            self.assertEqual(await LobeTaskRunner.preprocess(worker, tab, [" ", None, "73"]), [-1, -1, 73])
            self.assertEqual(await LobeTaskRunner.preprocess(worker, tab, ["42", -1, "73"]), [42, -1, 73])

    async def test_keeps_numeric_precision_and_leaves_text_unchanged(self):
        dependency = SimpleNamespace(inputs=[
            Number(label="Seed", minimum=-1, precision=0),
            Number(label="Guidance", minimum=0),
            Slider(1, 128, label="Steps"),
            Textbox(label="Prompt"),
        ])
        worker = SimpleNamespace(inputs={"txt2img": dependency, "img2img": dependency})

        for tab in worker.inputs:
            with self.subTest(tab=tab):
                self.assertEqual(
                    await LobeTaskRunner.preprocess(worker, tab, ["9007199254740993", "3.5", "32", "123"]),
                    [9007199254740993, 3.5, 32, "123"],
                )

    async def test_reports_invalid_number_with_field_label(self):
        dependency = SimpleNamespace(inputs=[Number(label="Seed", minimum=-1)])
        worker = SimpleNamespace(inputs={"txt2img": dependency})
        for value, message in [("abc", "expected a number"), ("NaN", "expected a number"), ("-2", "minimum")]:
            with self.subTest(value=value):
                with self.assertRaisesRegex(ValueError, f"Seed: .*{message}"):
                    await LobeTaskRunner.preprocess(worker, "txt2img", [value])
