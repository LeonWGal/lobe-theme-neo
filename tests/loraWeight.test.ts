import { afterEach, expect, it, vi } from 'vitest';

import { startLoraTools } from '@/features/Tools/loraTools';

vi.mock('@/features/Tools/api', () => ({
  getLoras: async () => [{ alias: 'alias', arch: 'xl', name: 'model', triggerWords: ['vase'] }],
  getModel: async () => ({ arch: 'xl' }),
  userdata: {
    get: async (key: string, fallback: unknown) =>
      key === 'loraWeights' ? { model: 1.3 } : fallback,
    set: vi.fn(async () => undefined),
  },
}));

let stop: (() => void) | undefined;
afterEach(() => {
  stop?.();
  document.body.replaceChildren();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it('uses the saved weight after native insertion with a literal preferred weight, preserving activation text', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('gradioApp', () => document);
  vi.stubGlobal('updateInput', (element: HTMLElement) =>
    element.dispatchEvent(new Event('input', { bubbles: true })),
  );
  document.body.innerHTML =
    '<div id="txt2img_prompt"><textarea></textarea></div><div id="txt2img_neg_prompt"><textarea></textarea></div><div id="txt2img_lora_cards"><div class="card" data-name="model"><div class="actions"></div></div></div>';
  const card = document.querySelector<HTMLElement>('.card')!;
  card.setAttribute('onclick', "'<lora:alias:' + 0.7 + '>'");
  const box = document.querySelector<HTMLTextAreaElement>('#txt2img_prompt textarea')!;
  card.addEventListener('click', () => {
    box.value = box.value ? '' : '<lora:alias:0.7>, vase';
  });
  stop = startLoraTools({
    colors: { fill: '#eee', primary: '#286800', primaryLight: '#348a00' },
    text: {
      all: 'All',
      compatible: 'Compatible',
      favorite: 'Favorite',
      favorites: 'Favorites',
      recent: 'Recent',
      triggerWords: 'Triggers',
      weight: 'Weight',
    },
  });
  await vi.advanceTimersByTimeAsync(1);
  const regularWheel = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 120 });
  document.querySelector('.actions')!.dispatchEvent(regularWheel);
  expect(regularWheel.defaultPrevented).toBe(false);
  card.click();
  await vi.advanceTimersByTimeAsync(1);
  expect(box.value).toBe('<lora:alias:1.3>, vase');
  card.click();
  await vi.advanceTimersByTimeAsync(1);
  expect(box.value).toBe('');
});

it('keeps cancelable wheel interception off the document and limits it to weight controls', async () => {
  vi.useFakeTimers();
  document.body.innerHTML =
    '<div id="txt2img_lora_cards"><div class="card" data-name="model"><div class="actions"></div></div></div>';
  const spy = vi.spyOn(document, 'addEventListener');
  stop = startLoraTools({
    colors: { fill: '#eee', primary: '#286800', primaryLight: '#348a00' },
    text: {
      all: 'All',
      compatible: 'Compatible',
      favorite: 'Favorite',
      favorites: 'Favorites',
      recent: 'Recent',
      triggerWords: 'Triggers',
      weight: 'Weight',
    },
  });
  await vi.advanceTimersByTimeAsync(1);
  expect(spy.mock.calls.filter(([type]) => type === 'wheel')).toHaveLength(0);
  const value = document.querySelector('.lobe-lora-controls .value')!;
  const zoom = new WheelEvent('wheel', {
    bubbles: true,
    cancelable: true,
    ctrlKey: true,
    deltaY: -120,
  });
  value.dispatchEvent(zoom);
  expect(zoom.defaultPrevented).toBe(false);
  const weight = Number(value.textContent);
  const wheel = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -120 });
  value.dispatchEvent(wheel);
  expect(wheel.defaultPrevented).toBe(true);
  expect(document.querySelector('.lobe-lora-controls .value')).toBe(value);
  expect(Number(document.querySelector('.lobe-lora-controls .value')!.textContent)).toBeCloseTo(
    weight + 0.05,
  );
  spy.mockRestore();
});
