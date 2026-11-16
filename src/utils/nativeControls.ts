import { isPromptOutputMutation } from '@/utils/promptMutations';

export interface NativeControlLabels {
  emptyGallery: string;
  openFolder: string;
  pasteParameters: string;
  randomSeed: string;
  randomVariationSeed: string;
  reuseSeed: string;
  reuseVariationSeed: string;
  saveArchive: string;
  saveImage: string;
  sendToExtras: string;
  sendToImg2img: string;
  sendToInpaint: string;
  upscale: string;
}

/** Add names to native icon buttons without replacing Forge's event handlers. */
export function labelNativeControls(root: ParentNode, labels: NativeControlLabels) {
  const applied = new Map<HTMLElement, { label?: string; title?: string }>();
  const names: Record<string, string> = { paste: labels.pasteParameters };
  for (const tab of ['txt2img', 'img2img']) {
    Object.assign(names, {
      [`${tab}_random_seed`]: labels.randomSeed,
      [`${tab}_random_subseed`]: labels.randomVariationSeed,
      [`${tab}_reuse_seed`]: labels.reuseSeed,
      [`${tab}_reuse_subseed`]: labels.reuseVariationSeed,
      [`${tab}_open_folder`]: labels.openFolder,
      [`save_${tab}`]: labels.saveImage,
      [`save_zip_${tab}`]: labels.saveArchive,
      [`${tab}_send_to_img2img`]: labels.sendToImg2img,
      [`${tab}_send_to_inpaint`]: labels.sendToInpaint,
      [`${tab}_send_to_extras`]: labels.sendToExtras,
      [`${tab}_upscale`]: labels.upscale,
    });
  }
  const enhance = (node: ParentNode) => {
    const buttons = [...node.querySelectorAll<HTMLButtonElement>('button[id]')];
    if (node instanceof HTMLButtonElement) buttons.push(node);
    for (const button of buttons) {
      if (!names[button.id] || applied.has(button)) continue;
      const owned: { label?: string; title?: string } = {};
      if (!button.hasAttribute('aria-label')) {
        const dictionary = (window as Window & { localization?: Record<string, string> }).localization;
        owned.label = button.title && dictionary && Object.keys(dictionary).length
          ? dictionary[button.title] || button.title : names[button.id];
        button.setAttribute('aria-label', owned.label);
      }
      if (!button.title) {
        owned.title = names[button.id];
        button.title = owned.title;
      }
      applied.set(button, owned);
    }
  };
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (isPromptOutputMutation(mutation)) continue;
      for (const node of mutation.addedNodes) if (node instanceof HTMLElement) enhance(node);
    }
  });
  enhance(root);
  observer.observe(root, { childList: true, subtree: true });
  return () => {
    observer.disconnect();
    applied.forEach((value, element) => {
      if (element.getAttribute('aria-label') === value.label) element.removeAttribute('aria-label');
      if (element.getAttribute('title') === value.title) element.removeAttribute('title');
    });
  };
}

function attachGalleryFeedback(
  root: ParentNode,
  gallery: HTMLElement,
  tab: string,
  message: string,
) {
  const buttons = () =>
    [...root.querySelectorAll<HTMLButtonElement>(`#image_buttons_${tab} button`)].filter(
      (button) => !button.id.endsWith('_open_folder'),
    );
  const owned = new Set<HTMLButtonElement>();
  const hint = document.createElement('div');
  hint.className = 'lobe-gallery-empty-feedback';
  hint.textContent = message;
  hint.setAttribute('role', 'status');
  gallery.append(hint);
  let frame = 0;
  const sync = () => {
    frame = 0;
    const hasImage = Boolean(gallery.querySelector('img[src]:not([src=""])'));
    hint.hidden = hasImage;
    const host = (!hasImage && gallery.querySelector('.empty')) || gallery;
    if (hint.parentElement !== host) host.append(hint);
    for (const button of buttons()) {
      if (!hasImage && !button.disabled) {
        button.disabled = true;
        owned.add(button);
      } else if (hasImage && owned.delete(button)) button.disabled = false;
    }
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(sync);
  };
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => !isPromptOutputMutation(mutation))) schedule();
  });
  observer.observe(gallery, {
    attributeFilter: ['src'],
    attributes: true,
    childList: true,
    subtree: true,
  });
  const actions = root.querySelector(`#image_buttons_${tab}`);
  if (actions) observer.observe(actions, { childList: true, subtree: true });
  sync();
  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    hint.remove();
    owned.forEach((button) => {
      button.disabled = false;
    });
  };
}

/** Own only disabled states introduced for an empty gallery; preserve pre-existing ones. */
export function galleryFeedback(root: ParentNode, message: string) {
  const cleanups: (() => void)[] = [];
  for (const tab of ['txt2img', 'img2img', 'extras']) {
    const gallery = root.querySelector<HTMLElement>(`#${tab}_gallery`);
    if (gallery) cleanups.push(attachGalleryFeedback(root, gallery, tab, message));
  }
  return () => cleanups.forEach((cleanup) => cleanup());
}

interface SourceLabels {
  extrasSource: string;
  pngNoParameters: string;
  pngSource: string;
}

/** Explain the input step and gate PNG Info actions while preserving Forge's handlers. */
export function enhanceSourceTabs(root: ParentNode, labels: SourceLabels) {
  const extrasModes = root.querySelector('#mode_extras');
  const extrasHint = document.createElement('p');
  extrasHint.className = 'lobe-source-hint';
  extrasHint.textContent = labels.extrasSource;
  extrasModes?.before(extrasHint);

  const tab = root.querySelector('#tab_pnginfo');
  const source = tab?.querySelector('#pnginfo_image');
  const field = tab?.querySelector<HTMLTextAreaElement>('#pnginfo_generation_info textarea');
  if (!tab || !source || !field) return () => extrasHint.remove();

  const buttonSelector = 'button:is(#txt2img_tab, #img2img_tab, #inpaint_tab, #extras_tab)';
  const buttons = [...tab.querySelectorAll<HTMLButtonElement>(buttonSelector)];
  const original = new Map(buttons.map((button) => [button, button.getAttribute('aria-disabled')]));
  const hint = document.createElement('p');
  hint.className = 'lobe-source-hint';
  hint.setAttribute('role', 'status');
  buttons[0]?.parentElement?.before(hint);

  const available = (button: HTMLButtonElement, hasImage: boolean) =>
    hasImage && (button.id === 'extras_tab' || Boolean(field.value.trim()));
  const hasSource = () => Boolean(source.querySelector('img[src]:not([src=""])'));
  const sync = () => {
    const hasImage = hasSource();
    const message = hasImage ? (field.value.trim() ? '' : labels.pngNoParameters) : labels.pngSource;
    if (hint.textContent !== message) hint.textContent = message;
    hint.hidden = !message;
    for (const button of buttons) {
      const unavailable = !available(button, hasImage);
      if (Object.hasOwn(button.dataset, 'lobePngUnavailable') === unavailable) continue;
      button.toggleAttribute('data-lobe-png-unavailable', unavailable);
      const previous = unavailable ? 'true' : original.get(button);
      if (previous === null || previous === undefined) button.removeAttribute('aria-disabled');
      else button.setAttribute('aria-disabled', previous);
    }
  };
  const guard = (event: Event) => {
    const target = event.target instanceof Element && event.target.closest<HTMLButtonElement>(buttonSelector);
    if (target && !available(target, hasSource())) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  const observer = new MutationObserver(sync);
  // Gradio updates the hidden field and rendered metadata together.
  observer.observe(tab, { attributeFilter: ['src'], attributes: true, childList: true, subtree: true });
  field.addEventListener('input', sync);
  field.addEventListener('change', sync);
  tab.addEventListener('click', guard, true);
  sync();

  return () => {
    observer.disconnect();
    field.removeEventListener('input', sync);
    field.removeEventListener('change', sync);
    tab.removeEventListener('click', guard, true);
    for (const [button, previous] of original) {
      if (!Object.hasOwn(button.dataset, 'lobePngUnavailable')) continue;
      delete button.dataset.lobePngUnavailable;
      if (previous === null) button.removeAttribute('aria-disabled');
      else button.setAttribute('aria-disabled', previous);
    }
    extrasHint.remove();
    hint.remove();
  };
}
