import { afterEach, expect, it, vi } from 'vitest';

import { startSingleAccordion } from '@/features/Tools/accordions';
import { startPromptSections } from '@/features/Tools/promptSections';
import { codeToHtml } from '@/modules/PromptHighlight/features/tokenize';

let stop: (() => void) | undefined;
afterEach(() => {
  stop?.();
  stop = undefined;
  document.body.replaceChildren();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
function promptFixture(text: string) {
  vi.stubGlobal('gradioApp', () => document);
  vi.stubGlobal('updateInput', (el: HTMLElement) =>
    el.dispatchEvent(new Event('input', { bubbles: true })),
  );
  document.body.innerHTML =
    '<div id="txt2img_prompt"><label><textarea></textarea></label></div><div id="txt2img_tools"><div class="form"><button class="native-tool"></button></div></div>';
  const area = document.querySelector('textarea')!;
  area.value = text;
  stop = startPromptSections({
    colors: ['green'],
    text: { add: 'Add', merge: 'Merge', section: 'Section', toggle: 'Sections', tokens: 'Tokens' },
  });
  document.querySelector<HTMLButtonElement>('#lobe_txt2img_sections')!.click();
  return area;
}
it('keeps more than six BREAK sections and preserves an untouched round trip exactly', () => {
  const text = Array.from({ length: 9 }, (_, i) => `  concept ${i}  `).join('\nBREAK\n');
  const area = promptFixture(text);
  expect(document.querySelectorAll('.lobe-section textarea')).toHaveLength(9);
  document.querySelector<HTMLButtonElement>('#lobe_txt2img_sections')!.click();
  expect(area.value).toBe(text);
});
it('writes edits through to the native prompt and follows external TIPO-style assignments while focused', () => {
  const area = promptFixture(
    'first BREAK second BREAK third BREAK fourth BREAK fifth BREAK sixth BREAK seventh',
  );
  const boxes = [...document.querySelectorAll<HTMLTextAreaElement>('.lobe-section textarea')];
  boxes[1].value = 'edited';
  boxes[1].dispatchEvent(new Event('input', { bubbles: true }));
  expect(area.value).toContain('edited');
  expect(area.value).toContain('seventh');
  boxes[1].focus();
  area.value = 'TIPO result BREAK retained';
  expect(
    [...document.querySelectorAll<HTMLTextAreaElement>('.lobe-section textarea')].map(
      (box) => box.value,
    ),
  ).toEqual(['TIPO result', 'retained']);
  stop?.();
  stop = undefined;
  expect(area.value).toBe('TIPO result BREAK retained');
});
it('folds an enabled input accordion without switching its checkbox off', async () => {
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockImplementation(() => document.body);
  vi.useFakeTimers();
  vi.stubGlobal('gradioApp', () => document);
  document.body.innerHTML =
    '<div id="tab_txt2img"><div class="gradio-accordion input-accordion"><button class="label-wrap open"><input type="checkbox" checked>Enabled extension</button><div>Options</div></div><div class="gradio-accordion"><button class="label-wrap">Other</button><div>Options</div></div></div>';
  const headers = document.querySelectorAll<HTMLButtonElement>('.label-wrap');
  headers[1].addEventListener('click', () => headers[1].classList.toggle('open'));
  stop = startSingleAccordion();
  headers[1].click();
  await vi.advanceTimersByTimeAsync(61);
  expect(document.querySelector('.input-accordion')).toHaveClass('lobe-folded');
  expect(document.querySelector('input')).toBeChecked();
});
it('escapes prompt markup and preserves syntax text and newlines with the lightweight grammar', () => {
  const text =
    '<lora:portrait:0.8>, (soft light:1.2)\nBREAK\n__wildcard__, <img src=x onerror=alert(1)>';
  const html = codeToHtml(text, false);
  const host = document.createElement('div');
  host.innerHTML = html;
  expect(host.querySelector('code')?.textContent).toBe(text);
  expect(host.querySelector('img')).toBeNull();
  expect(host.querySelectorAll('span[style]').length).toBeGreaterThan(2);
});
