import { expect, it, vi } from 'vitest';

import { enhanceImageViewer } from '@/utils/imageViewer';

it('enhances native viewer controls and restores the gallery focus on close', async () => {
  document.body.innerHTML = `
    <div class="gradio-gallery"><button>Gallery image</button></div>
    <div id="lightboxModal" tabindex="0" style="display: none">
      <div class="modalControls">
        <span class="modalZoom"></span><span class="modalTileImage"></span>
        <span class="modalToggleLivePreview"></span><span class="modalSave"></span>
        <span class="modalClose"></span>
      </div>
      <img id="modalImage">
    </div>`;
  const modal = document.querySelector<HTMLElement>('#lightboxModal')!;
  const image = document.querySelector<HTMLImageElement>('#modalImage')!;
  const zoom = document.querySelector<HTMLElement>('.modalZoom')!;
  const save = document.querySelector<HTMLElement>('.modalSave')!;
  const galleryButton = document.querySelector<HTMLButtonElement>('.gradio-gallery button')!;
  const nativeSave = vi.fn();
  save.onclick = nativeSave;
  zoom.onclick = () => image.classList.toggle('modalImageFullscreen');
  Object.defineProperties(image, { naturalHeight: { value: 768 }, naturalWidth: { value: 1536 } });

  const dispose = enhanceImageViewer(document, {
    '.modalClose': 'Close',
    '.modalSave': 'Save image',
    '.modalTileImage': 'Tile',
    '.modalZoom': 'Fit image',
    'viewer': 'Image viewer',
  });
  try {
    galleryButton.focus();
    modal.style.display = 'flex';
    modal.focus();
    await Promise.resolve();
    expect(document.activeElement).toBe(modal.querySelector('.modalClose'));
    zoom.click();
    await Promise.resolve();
    expect(zoom.getAttribute('aria-pressed')).toBe('true');
    expect(modal.querySelector('.lobe-viewer-size')?.textContent).toBe('1536 × 768');

    save.focus();
    save.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
    expect(nativeSave).toHaveBeenCalledOnce();
    image.style.display = 'none';
    await Promise.resolve();
    expect(modal.querySelector('.modalTileImage')?.getAttribute('aria-pressed')).toBe('true');
    expect(modal.querySelector<HTMLElement>('.lobe-viewer-size')?.hidden).toBe(true);

    modal.style.display = 'none';
    await Promise.resolve();
    expect(document.activeElement).toBe(galleryButton);
  } finally {
    dispose();
  }
  expect(image.parentElement).toBe(modal);
  expect(save.onclick).toBe(nativeSave);
  document.body.replaceChildren();
});
