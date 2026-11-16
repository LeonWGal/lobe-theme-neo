import { expect, it, vi } from 'vitest';

import { enhanceLiveGenerationViewer } from '@/utils/liveGenerationViewer';

it('follows only the opened live preview and keeps its last frame after it ends', async () => {
  document.body.innerHTML = `
    <div id="txt2img_gallery">
      <img src="/old.png">
      <div class="livePreview"><img src="/frame-1.png"></div>
    </div>
    <div id="img2img_gallery"><div class="livePreview"><img src="/unrelated.png"></div></div>`;
  const dialogs = HTMLDialogElement.prototype;
  const showModal = Object.getOwnPropertyDescriptor(dialogs, 'showModal');
  const close = Object.getOwnPropertyDescriptor(dialogs, 'close');
  Object.defineProperties(dialogs, {
    showModal: { configurable: true, value(this: HTMLDialogElement) { this.open = true; } },
    close: { configurable: true, value(this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    } },
  });
  const dispose = enhanceLiveGenerationViewer(document, {
    close: 'Close', ended: 'Last frame', live: 'Generating', open: 'Expand',
  });
  try {
    const source = document.querySelector<HTMLImageElement>('#txt2img_gallery .livePreview > img')!;
    const nativeClick = vi.fn();
    source.parentElement!.addEventListener('click', nativeClick, true);
    source.click();
    expect(nativeClick).not.toHaveBeenCalled();
    const viewer = document.querySelector('dialog')!;
    const image = viewer.querySelector('img')!;
    expect(image.getAttribute('src')).toMatch(/frame-1\.png$/);

    source.insertAdjacentHTML('afterend', '<img src="/frame-2.png">');
    document.querySelector('#img2img_gallery .livePreview')!.insertAdjacentHTML('beforeend', '<img src="/unrelated-2.png">');
    await Promise.resolve();
    expect(image.getAttribute('src')).toMatch(/frame-2\.png$/);
    source.parentElement!.remove();
    await Promise.resolve();
    expect(viewer.querySelector('header')?.textContent).toBe('Last frame');
    expect(image.getAttribute('src')).toMatch(/frame-2\.png$/);

    viewer.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' }));
    expect(document.querySelector('dialog')).toBeNull();
  } finally {
    dispose();
    if (showModal) Object.defineProperty(dialogs, 'showModal', showModal);
    else Reflect.deleteProperty(dialogs, 'showModal');
    if (close) Object.defineProperty(dialogs, 'close', close);
    else Reflect.deleteProperty(dialogs, 'close');
    document.body.replaceChildren();
  }
});
