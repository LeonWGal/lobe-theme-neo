import { afterEach, expect, it, vi } from 'vitest';

import {
  type NativeControlLabels,
  enhanceSourceTabs,
  galleryFeedback,
  labelNativeControls,
} from '@/utils/nativeControls';

let cleanup: (() => void) | undefined;
afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.unstubAllGlobals();
  vi.useRealTimers();
  document.body.replaceChildren();
});
const labels = {
  randomSeed: 'Random seed',
  randomVariationSeed: 'Random variation',
  reuseSeed: 'Reuse seed',
  reuseVariationSeed: 'Reuse variation',
  emptyGallery: 'Generate an image',
  openFolder: 'Open folder',
  pasteParameters: 'Apply parameters',
  saveImage: 'Save',
  saveArchive: 'ZIP',
  sendToImg2img: 'img2img',
  sendToInpaint: 'inpaint',
  sendToExtras: 'Extras',
  upscale: 'Upscale',
} satisfies NativeControlLabels;

it('labels native tools without losing their handlers or original help', async () => {
  document.body.innerHTML =
    '<button id="txt2img_random_seed" title="Detailed help"></button><button id="txt2img_random_subseed"></button>';
  const click = vi.fn();
  document.querySelector('button')!.addEventListener('click', click);
  cleanup = labelNativeControls(document, labels);
  const seed = document.querySelector<HTMLButtonElement>('#txt2img_random_seed')!;
  expect(seed).toHaveAccessibleName('Random seed');
  expect(seed.title).toBe('Detailed help');
  seed.click();
  expect(click).toHaveBeenCalledTimes(1);
  const late = document.createElement('button');
  late.id = 'img2img_reuse_subseed';
  document.body.append(late);
  await Promise.resolve();
  expect(late).toHaveAccessibleName('Reuse variation');
  cleanup();
  cleanup = undefined;
  expect(seed).not.toHaveAttribute('aria-label');
  expect(seed.title).toBe('Detailed help');
  expect(late).not.toHaveAttribute('title');
});

it('blocks empty-gallery actions and releases them when an image arrives', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => setTimeout(() => fn(0), 0));
  vi.stubGlobal('cancelAnimationFrame', clearTimeout);
  document.body.innerHTML =
    '<div id="txt2img_gallery"><div class="empty"><svg></svg></div></div><div id="image_buttons_txt2img"><button id="txt2img_open_folder"></button><button id="save_txt2img"></button><button id="native_disabled" disabled></button></div>';
  cleanup = galleryFeedback(document, labels.emptyGallery);
  const save = document.querySelector<HTMLButtonElement>('#save_txt2img')!;
  const open = document.querySelector<HTMLButtonElement>('#txt2img_open_folder')!;
  const native = document.querySelector<HTMLButtonElement>('#native_disabled')!;
  expect(save).toBeDisabled();
  expect(open).toBeEnabled();
  expect(document.querySelector('[role="status"]')).toHaveTextContent('Generate an image');
  expect(document.querySelector('.empty > [role="status"]')).not.toBeNull();
  document.querySelector('#txt2img_gallery')!.innerHTML = '<img src="result.png">';
  await vi.advanceTimersByTimeAsync(1);
  expect(save).toBeEnabled();
  expect(native).toBeDisabled();
  expect(document.querySelector('[role="status"]')).toHaveAttribute('hidden');
  document.querySelector('#txt2img_gallery')!.innerHTML = '<div class="empty"><svg></svg></div>';
  await vi.advanceTimersByTimeAsync(1);
  expect(save).toBeDisabled();
  expect(document.querySelector('.empty > [role="status"]')).toBeVisible();
  cleanup();
  cleanup = undefined;
  expect(save).toBeEnabled();
  expect(native).toBeDisabled();
});

it('allows Extras for an image without metadata and blocks stale PNG Info actions on clear', async () => {
  const root = document.createElement('div');
  root.innerHTML = `<div id="mode_extras"></div><section id="tab_pnginfo">
    <div id="pnginfo_image"></div><div id="pnginfo_generation_info"><textarea></textarea></div>
    <div><button id="txt2img_tab">txt2img</button><button id="extras_tab">Extras</button></div>
  </section>`;
  const extras = root.querySelector<HTMLButtonElement>('#extras_tab')!;
  const parameters = root.querySelector<HTMLButtonElement>('#txt2img_tab')!;
  const field = root.querySelector('textarea')!;
  const source = root.querySelector('#pnginfo_image')!;
  let sends = 0;
  for (const button of [extras, parameters]) button.onclick = () => sends++;
  const cleanup = enhanceSourceTabs(root, {
    extrasSource: 'Choose mode', pngNoParameters: 'No parameters', pngSource: 'Add image',
  });
  try {
    extras.click();
    expect(sends).toBe(0);
    expect(extras.getAttribute('aria-disabled')).toBe('true');
    source.innerHTML = '<img src="fixture.png">';
    await Promise.resolve();
    expect(extras.getAttribute('aria-disabled')).toBeNull();
    expect(parameters.getAttribute('aria-disabled')).toBe('true');
    extras.click();
    parameters.click();
    expect(sends).toBe(1);
    field.value = 'Steps: 20';
    field.dispatchEvent(new Event('input'));
    expect(parameters.getAttribute('aria-disabled')).toBeNull();
    parameters.click();
    expect(sends).toBe(2);
    source.replaceChildren();
    parameters.click();
    expect(sends).toBe(2);
  } finally {
    cleanup();
  }
});
