import { consola } from 'consola';
import { memo, useEffect } from 'react';

const moveGenerateWithEnqueue = (
  generateBox: HTMLDivElement | null,
  preview: HTMLDivElement | null,
) => {
  if (!generateBox || !preview) return;

  const actionsColumn = generateBox.closest('[id$="_actions_column"]') as HTMLElement | null;
  const enqueueWrapper =
    (actionsColumn?.querySelector('[id$="_enqueue_wrapper"]') as HTMLElement | null) ||
    (generateBox.parentElement?.querySelector('[id$="_enqueue_wrapper"]') as HTMLElement | null);

  let header = preview.querySelector('.lobe-split-action-header') as HTMLDivElement | null;
  if (!header) {
    header = document.createElement('div');
    header.className = 'lobe-split-action-header';
    preview.prepend(header);
  }

  if (!header.contains(generateBox)) {
    header.append(generateBox);
  }
  if (enqueueWrapper && !header.contains(enqueueWrapper)) {
    header.append(enqueueWrapper);
  }
};

const setupSplitView = (root: Element | Document) => {
  try {
    // tab_txt2img
    const txt2imgToprow = root.querySelector('#txt2img_toprow') as HTMLDivElement | null;
    const txt2imgSettings = root.querySelector('#txt2img_settings') as HTMLDivElement | null;
    const txt2imgGenerate = root.querySelector('#txt2img_generate_box') as HTMLDivElement | null;
    const txt2imgPreview = root.querySelector(
      '#txt2img_gallery_container',
    ) as HTMLDivElement | null;
    if (txt2imgToprow && txt2imgSettings && txt2imgGenerate && txt2imgPreview) {
      if (txt2imgSettings.firstChild !== txt2imgToprow) {
        txt2imgSettings.prepend(txt2imgToprow);
      }
      moveGenerateWithEnqueue(txt2imgGenerate, txt2imgPreview);
    }

    // tab_img2img
    const img2imgToprow = root.querySelector('#img2img_toprow') as HTMLDivElement | null;
    const img2imgSettings = root.querySelector('#img2img_settings') as HTMLDivElement | null;
    const img2imgGenerate = root.querySelector('#img2img_generate_box') as HTMLDivElement | null;
    const img2imgPreview = root.querySelector(
      '#img2img_gallery_container',
    ) as HTMLDivElement | null;
    if (img2imgSettings && img2imgToprow && img2imgGenerate && img2imgPreview) {
      if (img2imgSettings.firstChild !== img2imgToprow) {
        img2imgSettings.prepend(img2imgToprow);
      }
      moveGenerateWithEnqueue(img2imgGenerate, img2imgPreview);
    }

    // extras_img2img
    const extrasGenerate = root.querySelector('#extras_generate') as HTMLDivElement | null;
    const extrasPreview = root.querySelector('#extras_results') as HTMLDivElement | null;
    if (extrasGenerate && extrasPreview && extrasPreview.parentNode) {
      (extrasPreview.parentNode as HTMLDivElement).id = 'extras_gallery_container';
      let header = extrasPreview.querySelector('.lobe-split-action-header') as HTMLDivElement | null;
      if (!header) {
        header = document.createElement('div');
        header.className = 'lobe-split-action-header';
        extrasPreview.prepend(header);
      }
      if (!header.contains(extrasGenerate)) {
        header.append(extrasGenerate);
      }
    }
  } catch (error) {
    consola.error('🤯 [layout] inject - Split Previewer', error);
  }
};

const Preview = memo(() => {
  useEffect(() => {
    const getRoot = () => (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    const root = getRoot();

    setupSplitView(root);

    // Observe tab transitions or dynamic DOM mount
    const observer = new MutationObserver(() => {
      setupSplitView(getRoot());
    });

    const target = root.querySelector('#tabs') || root;
    observer.observe(target, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
});

export default Preview;
