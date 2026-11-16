import { expect, it, vi } from 'vitest';

import { applyPreset } from '@/features/Tools/presets';

it('sends the saved batch size with Forge paste and commits batch count through the range', async () => {
  document.body.innerHTML = `
    <div id="txt2img_prompt"><textarea>portrait</textarea></div>
    <div id="txt2img_neg_prompt"><textarea>blur</textarea></div>
    <button id="txt2img_paste"></button>
    <div id="txt2img_batch_count"><input type="number" value="1"><input type="range" min="1" max="8" value="1"></div>
  `;
  const prompt = document.querySelector('textarea')!;
  const paste = vi.fn(() => prompt.value);
  document.querySelector('button')!.addEventListener('click', paste);
  const range = document.querySelector<HTMLInputElement>('input[type=range]')!;
  const release = vi.fn();
  range.addEventListener('pointerup', release);

  expect(await applyPreset({
    batchCount: 3,
    batchSize: 2,
    created: 0,
    id: 'preset',
    name: 'Portrait',
    parameters: 'Steps: 32, CFG scale: 4, Batch size: 8',
    tab: 'txt2img',
  }, 'txt2img')).toBe(true);
  expect(paste).toHaveReturnedWith('portrait\nNegative prompt: blur\nSteps: 32, CFG scale: 4, Batch size: 2');
  expect(range.value).toBe('3');
  expect(release).toHaveBeenCalledOnce();
});
