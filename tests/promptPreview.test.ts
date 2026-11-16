import { beforeEach, expect, it } from 'vitest';

import { Converter } from '@/scripts/formatPrompt';
import { setPromptValue, undoPromptValue } from '@/utils/promptInput';

beforeEach(() => {
  document.body.innerHTML =
    '<div id="txt2img_prompt"><textarea>cat , [cat:dog:0.5], &lt;lora:a:1&gt;</textarea></div>';
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.dispatchEvent(new Event('close'));
  };
});
it('requires a preview confirmation and supports undo', () => {
  const textarea = document.querySelector('textarea')!;
  const before = textarea.value;
  Converter.onClickConvert('txt');
  expect(textarea.value).toBe(before);
  document.querySelector<HTMLButtonElement>('#lobe-prompt-preview button.primary')!.click();
  expect(textarea.value).toBe('cat, [cat:dog:0.5], <lora:a:1>');
  expect(undoPromptValue(textarea)).toBe(true);
  expect(textarea.value).toBe(before);
});
it('does not overwrite a prompt edited while the preview was open', () => {
  const textarea = document.querySelector('textarea')!;
  Converter.onClickConvert('txt');
  setPromptValue(textarea, 'new external value');
  const apply = document.querySelector<HTMLButtonElement>('#lobe-prompt-preview button.primary')!;
  apply.click();
  expect(textarea.value).toBe('new external value');
  expect(apply.disabled).toBe(true);
});
