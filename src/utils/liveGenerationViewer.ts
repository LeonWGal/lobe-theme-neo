import { bus } from '@/features/Tools/bus';
import { Maximize, X, svgIcon } from '@/icons/native';

type Labels = { close: string; ended: string; live: string; open: string };

/** Observe the originating gallery and keep its last live frame when Forge removes the preview. */
export function enhanceLiveGenerationViewer(root: Document, labels: Labels) {
  const galleries = new Map<string, { gallery: HTMLElement; observer: MutationObserver }>();
  let view: HTMLDialogElement | undefined;
  const gallerySelector = '#txt2img_gallery, #img2img_gallery';

  const close = () => view?.close();
  const open = (gallery: HTMLElement, trigger: HTMLElement) => {
    const preview = gallery.querySelector('.livePreview');
    const frame = preview?.querySelector<HTMLImageElement>('img:last-of-type');
    if (!preview || !frame?.src || view) return;

    const dialog = root.createElement('dialog');
    dialog.className = 'lobe-live-viewer';
    dialog.dataset.lobeLocalized = '';
    dialog.setAttribute('aria-label', labels.live);
    const header = root.createElement('header');
    const status = root.createElement('span');
    status.className = 'lobe-live-status';
    const button = root.createElement('button');
    button.type = 'button';
    button.title = labels.close;
    button.setAttribute('aria-label', labels.close);
    button.innerHTML = svgIcon(X, 20);
    button.onclick = close;
    header.append(status, button);
    const image = root.createElement('img');
    image.alt = labels.live;
    image.src = frame.src;
    const sync = () => {
      const next = gallery.contains(preview) ? preview?.querySelector<HTMLImageElement>('img:last-of-type') : null;
      if (next?.src && next.src !== image.src) image.src = next.src;
      const label = next ? labels.live : labels.ended;
      if (status.textContent !== label) status.textContent = label;
      dialog.toggleAttribute('data-generating', Boolean(next));
    };
    const observer = new MutationObserver(sync);
    observer.observe(gallery, { childList: true });
    observer.observe(preview, { attributeFilter: ['src'], childList: true, subtree: true });
    dialog.append(header, image);
    dialog.addEventListener('close', () => {
      observer.disconnect();
      dialog.remove();
      if (view === dialog) view = undefined;
      if (trigger.isConnected) trigger.focus({ preventScroll: true });
      else if (gallery.isConnected) {
        const previous = gallery.getAttribute('tabindex');
        gallery.tabIndex = -1;
        gallery.focus({ preventScroll: true });
        if (previous === null) gallery.removeAttribute('tabindex');
        else gallery.setAttribute('tabindex', previous);
      }
    }, { once: true });
    dialog.addEventListener('keydown', (event) => {
      // Forge uses Escape to interrupt generation outside the viewer.
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
    }, true);
    root.body.append(dialog);
    view = dialog;
    sync();
    dialog.showModal();
  };

  const addControl = (gallery: HTMLElement) => {
    const preview = gallery.querySelector('.livePreview');
    const existing = gallery.querySelector(':scope > .lobe-live-expand');
    if (!preview?.querySelector('img')) {
      existing?.remove();
      return;
    }
    if (existing) return;
    const button = root.createElement('button');
    button.type = 'button';
    button.className = 'lobe-live-expand';
    button.dataset.lobeLocalized = '';
    button.title = labels.open;
    button.setAttribute('aria-label', labels.open);
    button.innerHTML = svgIcon(Maximize, 18);
    gallery.append(button);
  };

  const watch = (gallery: HTMLElement) => {
    if (!gallery.matches(gallerySelector) || galleries.has(gallery.id)) return;
    const observer = new MutationObserver(() => addControl(gallery));
    observer.observe(gallery, { childList: true, subtree: true });
    galleries.set(gallery.id, { gallery, observer });
    addControl(gallery);
  };
  root.querySelectorAll<HTMLElement>(gallerySelector).forEach(watch);
  const unsubscribe = bus.on('gen:start', ({ gallery }) => {
    if (!gallery) return;
    const previous = galleries.get(gallery.id);
    if (previous && previous.gallery !== gallery) {
      previous.observer.disconnect();
      galleries.delete(gallery.id);
    }
    watch(gallery);
  });

  const onClick = (event: MouseEvent) => {
    if (event.button !== 0 || !(event.target instanceof Element)) return;
    const trigger = event.target.closest<HTMLElement>('.livePreview > img, .lobe-live-expand');
    const gallery = trigger?.closest<HTMLElement>(gallerySelector);
    if (!trigger || !gallery || !gallery.querySelector('.livePreview > img')) return;
    event.preventDefault();
    event.stopPropagation();
    open(gallery, trigger);
  };
  root.addEventListener('click', onClick, true);
  return () => {
    unsubscribe();
    root.removeEventListener('click', onClick, true);
    for (const { gallery, observer } of galleries.values()) {
      observer.disconnect();
      gallery.querySelectorAll('.lobe-live-expand').forEach((button) => button.remove());
    }
    close();
  };
}
