import type { WebuiSetting } from '@/store';

type PromptField = HTMLInputElement | HTMLTextAreaElement;
type Caret = (area: PromptField, position: number) => { height: number; left: number; top: number };
type Options = {
  animaArtistPrefix: WebuiSetting['autocompleteAnimaArtistPrefix'];
  appendComma: boolean;
  appendSpace: boolean;
  chantFile: string;
  delayTime: number;
  dictionary: string;
  dimUsedTags: boolean;
  escapeParentheses: boolean;
  extraAddMode: WebuiSetting['autocompleteExtraAddMode'];
  extraFiles: string[];
  formatMode: WebuiSetting['autocompleteFormatMode'];
  frequencySort: boolean;
  history: WebuiSetting['autocompleteHistory'];
  limit: number;
  loraArchFilter: WebuiSetting['autocompleteLoraArchFilter'];
  mode: WebuiSetting['autocompleteMode'];
  modelKeywordCompletion: WebuiSetting['autocompleteModelKeywordCompletion'];
  modelKeywordLocation: WebuiSetting['autocompleteModelKeywordLocation'];
  negative: WebuiSetting['autocompleteNegative'];
  placement: WebuiSetting['autocompletePlacement'];
  replaceUnderscores: boolean;
  selectUsedTag: boolean;
  useWildcards: boolean;
};

interface Presentation {
  hide: (area: PromptField, popup: HTMLElement) => void;
  loadingText: () => string;
  options: () => Options;
  show: (area: PromptField, popup: HTMLElement, caret: Caret) => void;
  update: (area: PromptField, list: HTMLElement) => void;
}

type ProviderWindow = Window & {
  lobeTagComplete?: {
    addArea?: (area: PromptField) => void;
    refresh: () => void;
    setPresentation: (presentation: Presentation | undefined) => void;
  };
};

export const attachAutocompleteArea = (area: PromptField) => {
  const provider = (window as ProviderWindow).lobeTagComplete;
  if (provider?.addArea) provider.addArea(area);
  else if (typeof addAutocompleteToArea === 'function') addAutocompleteToArea(area);
};

const attributes = ['aria-autocomplete', 'aria-controls', 'aria-activedescendant'] as const;
let nextList = 0;

export function connectAutocomplete(options: () => Options, loadingText: () => string) {
  const provider = (window as ProviderWindow).lobeTagComplete;
  if (!provider) return;
  let open: { area: PromptField; attributes: (string | null)[]; popup: HTMLElement } | undefined;
  let measure: Caret | undefined;
  let placementFrame = 0;

  const hide: Presentation['hide'] = (area, popup) => {
    if (open?.area !== area || open.popup !== popup) return;
    const previous = open.attributes;
    open = undefined;
    cancelAnimationFrame(placementFrame);
    placementFrame = 0;
    measure = undefined;
    delete popup.dataset.lobeAutocomplete;
    const list = popup.querySelector('.autocompleteResultsList');
    list?.removeAttribute('role');
    for (const item of list?.children ?? []) {
      item.removeAttribute('role');
      item.removeAttribute('aria-selected');
    }
    for (const key of ['--lobe-ac-left', '--lobe-ac-top', '--lobe-ac-width', '--lobe-ac-height', 'visibility'])
      popup.style.removeProperty(key);
    attributes.forEach((key, index) => {
      const value = previous[index];
      if (value === null) area.removeAttribute(key);
      else area.setAttribute(key, value);
    });
  };

  const update: Presentation['update'] = (area, list) => {
    if (open?.area !== area) return;
    list.id ||= `lobe-autocomplete-${++nextList}`;
    list.setAttribute('role', 'listbox');
    area.setAttribute('aria-controls', list.id);
    area.setAttribute('aria-autocomplete', 'list');
    let active = '';
    [...list.children].forEach((item, index) => {
      if (item.classList.contains('acLoading')) return;
      if (!item.id) item.id = `${list.id}-${index}`;
      if (item.getAttribute('role') !== 'option') item.setAttribute('role', 'option');
      const selected = item.classList.contains('selected');
      if (item.getAttribute('aria-selected') !== String(selected)) item.setAttribute('aria-selected', String(selected));
      if (selected) active = item.id;
    });
    if (active) area.setAttribute('aria-activedescendant', active);
    else area.removeAttribute('aria-activedescendant');
  };

  const schedulePlacement = () => {
    if (!open || placementFrame) return;
    placementFrame = requestAnimationFrame(() => {
      placementFrame = 0;
      if (!open?.area.isConnected || !measure) return;
      const { area, popup } = open;
      const field = area.getBoundingClientRect();
      const viewport = window.visualViewport;
      const left = viewport?.offsetLeft ?? 0;
      const top = viewport?.offsetTop ?? 0;
      const right = left + (viewport?.width ?? innerWidth) - 8;
      const bottom = top + (viewport?.height ?? innerHeight) - 8;
      const width = Math.max(0, Math.min(right - left - 8, Math.max(216, Math.min(340, field.width))));
      const caret = measure(area, area.selectionEnd ?? 0);
      const lineHeight = caret.height || 20;
      const x = Math.max(field.left, field.left + (caret.left || 0) - area.scrollLeft);
      const lineTop = Math.max(field.top, Math.min(field.bottom - lineHeight,
        field.top + (caret.top || 0) - area.scrollTop));
      const aboveAnchor = Math.min(bottom, lineTop - 4);
      const belowAnchor = Math.max(top + 8, Math.min(bottom, lineTop + lineHeight + 4));
      const below = bottom - belowAnchor;
      const above = Math.max(0, aboveAnchor - top - 8);
      const upward = below < 120 && above > below;
      popup.dataset.lobeAutocomplete = upward ? 'above' : 'below';
      popup.style.setProperty('--lobe-ac-left', `${Math.max(left + 8, Math.min(x, right - width))}px`);
      popup.style.setProperty('--lobe-ac-top', `${upward ? aboveAnchor : belowAnchor}px`);
      popup.style.setProperty('--lobe-ac-width', `${width}px`);
      popup.style.setProperty('--lobe-ac-height', `${Math.max(40, Math.min(320, upward ? above : below))}px`);
      popup.style.removeProperty('visibility');
    });
  };

  provider.setPresentation({
    hide,
    loadingText,
    options,
    show(area, popup, measureCaret) {
      if (open && open.popup !== popup) {
        open.popup.style.display = 'none';
        hide(open.area, open.popup);
      }
      open ??= { area, attributes: attributes.map((key) => area.getAttribute(key)), popup };
      if (!popup.dataset.lobeAutocomplete) popup.style.visibility = 'hidden';
      measure = measureCaret;
      schedulePlacement();
      const list = popup.querySelector<HTMLElement>('.autocompleteResultsList');
      if (list) update(area, list);
    },
    update,
  });
  let previousOptions = options();
  const refresh = () => provider.refresh();
  const onSettings = () => {
    const next = options();
    if (
      next.dictionary !== previousOptions.dictionary ||
      next.history !== previousOptions.history || next.limit !== previousOptions.limit ||
      next.mode !== previousOptions.mode || next.negative !== previousOptions.negative
    ) refresh();
    previousOptions = next;
  };
  const onResize = schedulePlacement;
  const onScroll = (event: Event) => {
    if (open && event.target instanceof Node && open.popup.contains(event.target)) return;
    schedulePlacement();
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll, true);
  window.addEventListener('lobe:settings', onSettings);
  return () => {
    if (open) hide(open.area, open.popup);
    provider.setPresentation(undefined);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('lobe:settings', onSettings);
  };
}
