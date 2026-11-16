import { act } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { restorePromptsAfterReload } from '@/utils/promptReload';

beforeEach(() => {
  sessionStorage.clear();
  document.body.innerHTML = '';
  vi.useFakeTimers();
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});
it('restores both prompts when Gradio mounts after the theme', async () => {
  sessionStorage.setItem(
    'lobe-prompts-before-reload',
    JSON.stringify({
      time: Date.now(),
      prompts: [
        { tab: 'txt2img', negative: false, value: '(cat:1.4)' },
        { tab: 'txt2img', negative: true, value: '[bad:worst:0.5]' },
      ],
    }),
  );
  const cleanup = restorePromptsAfterReload();
  await act(async () => {
    document.body.innerHTML =
      '<div id="txt2img_prompt"><textarea></textarea></div><div id="txt2img_neg_prompt"><textarea></textarea></div>';
  });
  expect(document.querySelector<HTMLTextAreaElement>('#txt2img_prompt textarea')?.value).toBe(
    '(cat:1.4)',
  );
  expect(document.querySelector<HTMLTextAreaElement>('#txt2img_neg_prompt textarea')?.value).toBe(
    '[bad:worst:0.5]',
  );
  expect(sessionStorage.getItem('lobe-prompts-before-reload')).toBeNull();
  cleanup?.();
});
it('ignores an expired snapshot', () => {
  document.body.innerHTML = '<div id="txt2img_prompt"><textarea>current</textarea></div>';
  sessionStorage.setItem(
    'lobe-prompts-before-reload',
    JSON.stringify({
      time: Date.now() - 120_000,
      prompts: [{ tab: 'txt2img', negative: false, value: 'stale' }],
    }),
  );
  restorePromptsAfterReload();
  expect(document.querySelector('textarea')?.value).toBe('current');
});
