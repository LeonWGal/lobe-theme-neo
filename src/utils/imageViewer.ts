import { isPromptOutputMutation } from '@/utils/promptMutations';

/** Enhance Forge's viewer in place so its save, zoom and navigation handlers remain intact. */
export const enhanceImageViewer = (root: Document, labels: Record<string, string>) => {
  const originals = new Map<HTMLElement, Map<string, string | null>>();
  let modal: HTMLElement | null = null;
  let open = false;
  let returnFocus: HTMLElement | null = null;
  let detach: (() => void) | undefined;
  const setAttribute = (element: HTMLElement, name: string, value: string) => {
    if (!originals.has(element)) originals.set(element, new Map());
    const attributes = originals.get(element)!;
    if (!attributes.has(name)) attributes.set(name, element.getAttribute(name));
    element.setAttribute(name, value);
  };
  const sync = () => {
    if (!modal) return;
    const nextOpen = modal.style.display !== 'none' && modal.style.display !== '';
    if (!open && nextOpen && (root.activeElement === modal || !modal.contains(root.activeElement))) {
      (modal.querySelector<HTMLElement>('.modalClose') || modal).focus({ preventScroll: true });
    } else if (
      open && !nextOpen && returnFocus?.isConnected &&
      (modal.contains(root.activeElement) || root.activeElement === root.body)
    ) {
      returnFocus.focus({ preventScroll: true });
    }
    open = nextOpen;
  };
  const setup = () => {
    if (!modal) return;
    setAttribute(modal, 'role', 'dialog');
    setAttribute(modal, 'aria-modal', 'true');
    setAttribute(modal, 'aria-label', labels.viewer);
    for (const [selector, label] of Object.entries(labels)) {
      if (selector === 'viewer') continue;
      const control = modal.querySelector<HTMLElement>(selector);
      if (!control) continue;
      setAttribute(control, 'role', 'button');
      setAttribute(control, 'tabindex', '0');
      setAttribute(control, 'aria-label', label);
      setAttribute(control, 'title', label);
    }
  };
  const rememberFocus = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || modal?.contains(target)) return;
    returnFocus =
      target.closest<HTMLElement>('.gradio-gallery button') ||
      (root.activeElement instanceof HTMLElement ? root.activeElement : null);
  };
  const keydown = (event: KeyboardEvent) => {
    if (!open || !modal) return;
    const target = event.target as HTMLElement;
    if (
      target.matches('.modalControls > span, .modalPrev, .modalNext') &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      event.preventDefault();
      event.stopPropagation();
      target.click();
    } else if (event.key === 'Tab') {
      const controls = [...modal.querySelectorAll<HTMLElement>('[tabindex="0"]')].filter(
        (control) =>
          control.getClientRects().length && getComputedStyle(control).display !== 'none',
      );
      if (!controls.length) return;
      const index = controls.indexOf(root.activeElement as HTMLElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        controls.at(-1)!.focus();
      } else if (!event.shiftKey && (index === -1 || index === controls.length - 1)) {
        event.preventDefault();
        controls[0].focus();
      }
    }
  };
  const modalObserver = new MutationObserver(sync);
  let discovery: MutationObserver;
  const attach = () => {
    modal = root.querySelector('#lightboxModal');
    if (!modal) return;
    discovery.disconnect();
    setup();
    const viewer = modal;
    const image = viewer.querySelector<HTMLImageElement>('#modalImage');
    const live = viewer.querySelector<HTMLElement>('.modalToggleLivePreview');
    const toolbar = viewer.querySelector<HTMLElement>('.modalControls');
    const stage = root.createElement('div');
    const size = root.createElement('span');
    size.className = 'lobe-viewer-size';
    size.hidden = true;
    viewer.append(size);
    if (image) {
      stage.className = 'lobe-viewer-stage';
      image.before(stage);
      stage.append(image);
    }

    const updateSize = () => {
      const { naturalWidth = 0, naturalHeight = 0 } = image ?? {};
      size.hidden = !naturalWidth || !naturalHeight || image?.style.display === 'none';
      const dimensions = size.hidden ? '' : `${naturalWidth} × ${naturalHeight}`;
      if (size.textContent !== dimensions) size.textContent = dimensions;
    };
    const updateModes = () => {
      const zoom = viewer.querySelector<HTMLElement>('.modalZoom');
      const tile = viewer.querySelector<HTMLElement>('.modalTileImage');
      if (image && zoom && tile) {
        setAttribute(zoom, 'aria-pressed', String(image.classList.contains('modalImageFullscreen')));
        setAttribute(tile, 'aria-pressed', String(image.style.display === 'none'));
      }
      if (live) setAttribute(live, 'aria-pressed', String(live.textContent?.trim() === '\u{1F5C7}'));
      updateSize();
    };
    const modes = new MutationObserver(updateModes);
    if (image) modes.observe(image, { attributeFilter: ['style', 'class'], attributes: true });
    if (live) modes.observe(live, { characterData: true, childList: true, subtree: true });
    image?.addEventListener('load', updateSize);
    image?.addEventListener('error', updateSize);
    const keepToolbarOpen = (event: Event) => {
      if (event.target === toolbar) event.stopPropagation();
    };
    toolbar?.addEventListener('click', keepToolbarOpen);
    updateModes();
    detach = () => {
      modes.disconnect();
      image?.removeEventListener('load', updateSize);
      image?.removeEventListener('error', updateSize);
      toolbar?.removeEventListener('click', keepToolbarOpen);
      if (image) stage.replaceWith(image);
      size.remove();
    };
    modalObserver.observe(modal, { attributeFilter: ['style'], attributes: true });
    sync();
  };
  discovery = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.addedNodes.length && !isPromptOutputMutation(mutation)))
      attach();
  });
  discovery.observe(root.body, { childList: true, subtree: true });
  attach();
  root.addEventListener('mousedown', rememberFocus, true);
  root.addEventListener('focusin', rememberFocus);
  root.addEventListener('keydown', keydown, true);
  return () => {
    discovery.disconnect();
    modalObserver.disconnect();
    detach?.();
    root.removeEventListener('mousedown', rememberFocus, true);
    root.removeEventListener('focusin', rememberFocus);
    root.removeEventListener('keydown', keydown, true);
    originals.forEach((attributes, element) => {
      attributes.forEach((value, name) => {
        if (value === null) element.removeAttribute(name);
        else element.setAttribute(name, value);
      });
    });
  };
};
