import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { useGalleryObserver } from '@/hooks/useGalleryObserver';

afterEach(() => document.body.replaceChildren());

it('retains the image list for unrelated DOM changes and clears a removed selection', async () => {
  document.body.innerHTML =
    '<div id="gallery"><img data-testid="detailed-image" src="first.png"><div class="thumbnails"><button><img src="first.png"></button></div><button id="save"></button></div>';
  const view = renderHook(() => useGalleryObserver('#gallery'));
  const images = view.result.current.images;
  expect(view.result.current.image).toContain('first.png');
  await act(async () => {
    document.querySelector('#save')!.setAttribute('disabled', '');
  });
  expect(view.result.current.images).toBe(images);
  await act(async () => {
    document.querySelector('img[data-testid="detailed-image"]')!.remove();
  });
  expect(view.result.current.image).toBe('');
  expect(view.result.current.images).toBe(images);
  await act(async () => {
    document.querySelector('.thumbnails img')!.setAttribute('src', 'second.png');
  });
  expect(view.result.current.images[0]).toContain('second.png');
  view.unmount();
});
