import { isPromptOutputMutation } from '@/utils/promptMutations';
import { svgIcon } from '@/icons/native';
import { externalLink, messageCode, pencil, photoUp, sparkles, trashX } from '@/icons/tablerPaths';
import i18next from 'i18next';

const TAB_PREFIX_LIST = ['txt2img', 'img2img'] as const;
const MODEL_TYPE_LIST = [
  'textual_inversion',
  'hypernetworks',
  'checkpoints',
  'lora',
  'lycoris',
] as const;
const MODEL_TYPE = {
  checkpoints: 'ckp',
  hypernetworks: 'hyper',
  lora: 'lora',
  lycoris: 'lycoris',
  textual_inversion: 'ti',
} as const satisfies Record<(typeof MODEL_TYPE_LIST)[number], string>;
const CARDID_SUFFIX = 'cards' as const;

// CSS
const BTN_MARGIN = '0';
const BTN_FONT_SIZE = '15px';
const BTN_THUMB_FONT_SIZE = '100%';
const BTN_THUMB_DISPLAY = 'inline';
const BTN_THUMB_POS = 'static';
const BTN_THUMB_BACKGROUND_IMAGE = 'none';
const BTN_THUMB_BACKGROUND = 'rgba(0, 0, 0, 0.8)';
const CH_BTN_TXTS = new Set(['🌐', '💡', '🏷️']);

const DOM_CACHE_PREFIX = 'lobe' as const;
const DOM_CACHE_KEY = `${DOM_CACHE_PREFIX}Done` as const;
const DOM_CACHE_VALUE = '1' as const;
const actionLabels = {
  preview: 'sidebar.civitai.replacePreview',
  prompt: 'sidebar.civitai.previewPrompt',
  trigger: 'sidebar.civitai.triggerWords',
  url: 'sidebar.civitai.open',
} as const;

const labelAction = (node: HTMLElement) => {
  const type = node.dataset.lobeCivitaiIcon as keyof typeof actionLabels;
  if (!Object.hasOwn(actionLabels, type)) return;
  node.title = i18next.t(actionLabels[type]);
  node.setAttribute('aria-label', node.title);
  node.dataset.lobeLocalized = '';
};

const styleButton = (node: HTMLElement, isThumbMode: boolean) => {
  if (isThumbMode) {
    node.style.display = BTN_THUMB_DISPLAY;
    node.style.fontSize = BTN_THUMB_FONT_SIZE;
    node.style.position = BTN_THUMB_POS;
    node.style.backgroundImage = BTN_THUMB_BACKGROUND_IMAGE;
  } else {
    node.style.fontSize = BTN_FONT_SIZE;
    node.style.margin = BTN_MARGIN;
  }
};

type IStrictNullable<T> = T | null;
type INullable<T> = T | null | undefined;

function is_nullable<T>(v: INullable<T>): v is null | undefined {
  return v === undefined || v === null;
}

const updateCardForCivitai = () => {
  if (!document.querySelector('#tab_civitai_helper')) return;

  const replacePreviewText =
    (typeof (window as any).getTranslation === 'function'
      ? (window as any).getTranslation('replace preview')
      : null) || 'replace preview';

  // Get component
  const chAlwaysDisplayCkb = document.querySelector(
    '#ch_always_display_ckb input',
  ) as HTMLInputElement;
  const chShowButtonOnThumbCkb = document.querySelector(
    '#ch_show_btn_on_thumb_ckb input',
  ) as HTMLInputElement;
  const chAlwaysDisplay = chAlwaysDisplayCkb?.checked || false;
  const chShowButtonOnThumb = chShowButtonOnThumbCkb?.checked || false;

  // Change all "replace preview" into an icon
  let extraNetworkId: `${(typeof TAB_PREFIX_LIST)[number]}_${(typeof MODEL_TYPE_LIST)[number]}_${typeof CARDID_SUFFIX}`;
  let extraNetworkNode: IStrictNullable<HTMLElement>;
  let metadataButton: IStrictNullable<HTMLElement>;
  let additionalNode: HTMLElement;
  let replacePreviewButton: IStrictNullable<HTMLElement>;
  let ulNode: IStrictNullable<HTMLElement>;
  let searchTermNode: IStrictNullable<HTMLElement>;
  let searchTerm = '';
  let modelType: (typeof MODEL_TYPE)[keyof typeof MODEL_TYPE];
  let cards: INullable<
    NodeListOf<
      HTMLElement & {
        dataset: {
          [DOM_CACHE_KEY]?: typeof DOM_CACHE_VALUE;
        };
      }
    >
  >;
  let needToAddButtons = false;
  let isThumbMode = false;

  const modelTypeHasCards: (typeof MODEL_TYPE_LIST)[number][] = [];

  // Get current tab
  for (const activeTabType of TAB_PREFIX_LIST) {
    for (const jsModelType of MODEL_TYPE_LIST) {
      modelType = MODEL_TYPE[jsModelType];
      // Get model_type for python side

      extraNetworkId = `${activeTabType}_${jsModelType}_${CARDID_SUFFIX}`;
      extraNetworkNode = document.querySelector(`#${extraNetworkId}` as const);

      // Check if extra network node exists
      if (is_nullable(extraNetworkNode)) continue;

      // Check if extr network is under thumbnail mode
      isThumbMode = extraNetworkNode.classList.contains('extra-network-thumbs');

      // Get all card nodes
      cards = extraNetworkNode.querySelectorAll('.card');
      const pending = !!document.querySelector(`#${extraNetworkId}_html .pending`);
      if (!cards?.length || pending) {
        if (!pending && extraNetworkNode.querySelector('.nocards')) {
          modelTypeHasCards.push(jsModelType);
        }

        continue;
      }

      modelTypeHasCards.push(jsModelType);

      for (const card of cards) {
        if (card.dataset[DOM_CACHE_KEY] === DOM_CACHE_VALUE) continue;
        card.dataset[DOM_CACHE_KEY] = DOM_CACHE_VALUE;
        needToAddButtons = false;
        if (card.querySelectorAll('.actions .additional a').length > 2) continue;
        // Metadata_buttoncard
        metadataButton = card.querySelector('.metadata-button');
        // Additional node
        additionalNode = card.querySelector('.actions .additional')!;
        if (!additionalNode) continue;

        // Get ul node, which is the parent of all buttons
        ulNode = card.querySelector('.actions .additional ul');
        if (is_nullable(ulNode)) {
          ulNode = document.createElement('ul');
          additionalNode.append(ulNode);
        }

        // Replace preview text button
        replacePreviewButton = card.querySelector('.actions .additional a:is(.replacepreview, [data-lobe-civitai-icon="preview"], [onclick*="replace_preview("])');
        replacePreviewButton ??= Array.from(additionalNode.querySelectorAll('a')).find(
          (action) => action.textContent?.trim() === replacePreviewText,
        ) ?? null;
        if (is_nullable(replacePreviewButton)) {
          replacePreviewButton = document.createElement('a');
          additionalNode.append(replacePreviewButton);
        }

        // Remove br tag
        ulNode.querySelector('br')?.remove();

        // Check thumb mode
        if (isThumbMode && additionalNode) {
          additionalNode.style.display = undefined as any as string;

          if (chShowButtonOnThumb) {
            ulNode.style.background = BTN_THUMB_BACKGROUND;
          } else {
            // Reset
            ulNode.style.background = undefined as any as string;
            // Remove existed buttons

            // Find all .a child nodes
            const atags = ulNode.querySelectorAll('a');
            if (!atags?.length) continue;
            for (const atag of atags) {
              // Reset display
              atag.style.display = undefined as any;
              // Remove extension's button
              if (atag.dataset.lobeCivitaiIcon || CH_BTN_TXTS.has(atag.innerHTML)) {
                // Need to remove
                atag.remove();
              } else if (atag === replacePreviewButton) {
                // Do not remove, just reset
                atag.textContent = replacePreviewText;
                atag.style.display = undefined as any;
                atag.style.fontSize = undefined as any;
                atag.style.position = undefined as any;
                atag.style.backgroundImage = undefined as any;
              }
            }

            // Just reset and remove nodes, do nothing else
            continue;
          }
        } else {
          // Full preview mode
          additionalNode.style.display = chAlwaysDisplay ? 'block' : (undefined as any as string);
        }

        for (const action of additionalNode.querySelectorAll('a[onclick], button[onclick]')) {
          const symbol = action.textContent?.trim().replaceAll('️', '');
          if (symbol !== '✏' && symbol !== '❌') continue;
          const label = action.getAttribute('title') || (symbol === '✏' ? 'Rename model' : 'Delete model');
          if (!action.hasAttribute('aria-label')) action.setAttribute('aria-label', label);
          action.innerHTML = svgIcon(symbol === '✏' ? pencil : trashX);
        }
        const previewIcon = svgIcon(photoUp);
        // Change replace preview text button into icon
        if (!replacePreviewButton.querySelector('svg')) {
          needToAddButtons = true;
          replacePreviewButton.innerHTML = previewIcon;
          if (replacePreviewButton.hasAttribute('onclick'))
            replacePreviewButton.dataset.lobeCivitaiIcon = 'preview';
          replacePreviewButton.title = replacePreviewText;
          labelAction(replacePreviewButton);
          styleButton(replacePreviewButton, isThumbMode);
        }

        if (!needToAddButtons) continue;
        // Search_term node
        // Search_term = subfolder path + model name + ext
        searchTermNode = card.querySelector('.actions .additional .search_term');
        if (!searchTermNode) continue;
        // Get search_term
        searchTerm = searchTermNode.innerHTML;
        if (!searchTerm) continue;

        // Then we need to add 3 buttons to each ul node:
        const openUrlNode = document.createElement('a');
        openUrlNode.href = '#';
        openUrlNode.innerHTML = svgIcon(externalLink);
        openUrlNode.dataset.lobeCivitaiIcon = 'url';
        styleButton(openUrlNode, isThumbMode);
        labelAction(openUrlNode);
        openUrlNode.setAttribute(
          'onclick',
          `open_model_url(event, '${modelType}', '${searchTerm}')`,
        );

        const addTriggerWordsNode = document.createElement('a');
        addTriggerWordsNode.href = '#';
        addTriggerWordsNode.innerHTML = svgIcon(sparkles);
        addTriggerWordsNode.dataset.lobeCivitaiIcon = 'trigger';
        styleButton(addTriggerWordsNode, isThumbMode);
        labelAction(addTriggerWordsNode);
        addTriggerWordsNode.setAttribute(
          'onclick',
          `add_trigger_words(event, '${modelType}', '${searchTerm}')`,
        );

        const usePreviewPromptNode = document.createElement('a');
        usePreviewPromptNode.href = '#';
        usePreviewPromptNode.innerHTML = svgIcon(messageCode);
        usePreviewPromptNode.dataset.lobeCivitaiIcon = 'prompt';
        styleButton(usePreviewPromptNode, isThumbMode);
        labelAction(usePreviewPromptNode);
        usePreviewPromptNode.setAttribute(
          'onclick',
          `use_preview_prompt(event, '${modelType}', '${searchTerm}')`,
        );

        // Add to card
        ulNode.append(openUrlNode);
        // Add br if metadata_button exists
        if (isThumbMode && metadataButton) ulNode.append(document.createElement('br'));
        ulNode.append(addTriggerWordsNode);
        ulNode.append(usePreviewPromptNode);
      }
    }
  }

  return modelTypeHasCards;
};

let cleanupActive: (() => void) | undefined;
let scheduleActive: (() => void) | undefined;

export default () => {
  if (cleanupActive) {
    scheduleActive?.();
    return cleanupActive;
  }
  if (!document.querySelector('#tab_civitai_helper')) return () => {};
  const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document.body;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => {
    if (timer !== undefined) return;
    timer = setTimeout(() => {
      timer = undefined;
      updateCardForCivitai();
    }, 120);
  };
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (!mutation.addedNodes.length || isPromptOutputMutation(mutation)) continue;
      if (mutation.target instanceof Element && mutation.target.closest('.extra-network-cards')) {
        schedule();
        break;
      }
      for (const node of mutation.addedNodes) {
        if (
          node instanceof HTMLElement &&
          (node.matches('.extra-network-cards') || node.querySelector('.extra-network-cards'))
        ) {
          schedule();
          return;
        }
      }
    }
  });
  observer.observe(root, { childList: true, subtree: true });
  const updateLabels = () => root.querySelectorAll<HTMLElement>('[data-lobe-civitai-icon]').forEach(labelAction);
  window.addEventListener('lobe:language', updateLabels);
  scheduleActive = schedule;
  cleanupActive = () => {
    observer.disconnect();
    window.removeEventListener('lobe:language', updateLabels);
    if (timer !== undefined) clearTimeout(timer);
    scheduleActive = undefined;
    cleanupActive = undefined;
  };
  updateCardForCivitai();
  return cleanupActive;
};
