/**
 * Extra tools on the WebUI's own LoRA cards (the cards stay the WebUI's, so
 * its search, sort, refresh and metadata editor keep working):
 * - a star to mark favourites, and the model family the LoRA was trained for;
 * - a weight control per LoRA: the weight used when the card is clicked, and
 *   the weight of that LoRA's tag if it is already in the prompt;
 * - a button that adds the LoRA's trigger words to the prompt;
 * - a filter bar: all, favourites, recently used, compatible with the model.
 */
import { isPromptOutputMutation } from '@/utils/promptMutations';
import { readableColor } from 'polished';

import { Minus, Plus, Star, Tag, svgIcon } from '@/icons/native';
import { cpu, history, layoutGrid } from '@/icons/tablerPaths';

import {
  type GenTab,
  appendToPrompt,
  negativeBox,
  promptBox,
  setInputValue,
} from '@/scripts/webui';
import { setNetworkPredicate } from '@/utils/networkPagination';

import type { Arch, LoraInfo } from './api';
import {
  ARCH_LABEL,
  cardAlias,
  currentArch,
  defaultWeight,
  formatWeight,
  isCompatible,
  loadLoraLists,
  loadLoras,
  loraTagPattern,
  pushRecent,
  setWeight,
  toggleFavorite,
  weightOf,
} from './loraData';

type Filter = 'all' | 'favorites' | 'recent' | 'compatible';

export interface LoraToolsText {
  all: string;
  compatible: string;
  favorite: string;
  favorites: string;
  recent: string;
  triggerWords: string;
  weight: string;
}

const CONTAINERS = '[id$="_lora_cards"]';
const STAR = svgIcon(Star, 16);
const TAG = svgIcon(Tag, 16);

const CSS = `
.lobe-lora-hidden { display: none !important; }
[id$="_lora_cards"] .card { position: relative; }
.lobe-lora-corner { position: absolute; z-index: 3; top: 4px; left: 4px; display: flex; flex-direction: column; gap: 3px; align-items: flex-start; pointer-events: none; }
.lobe-lora-corner > * { pointer-events: auto; }
.lobe-lora-star { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; color: rgb(255 255 255 / 85%); cursor: pointer; background: rgb(0 0 0 / 45%); border: none; border-radius: 6px; }
.lobe-lora-star svg { fill: none; }
.lobe-lora-star.active { display: flex; color: var(--lobe-accent-text); background: var(--lobe-field); }
.card:hover .lobe-lora-star { display: flex; }
.lobe-lora-star:hover { color: var(--lobe-accent-text); }
.lobe-lora-badge { padding: 1px 5px; font-size: var(--lobe-type-meta, 12px); font-weight: 600; line-height: var(--lobe-leading-meta, 16px); color: #fff; letter-spacing: 0.02em; background: rgb(0 0 0 / 55%); border-radius: 4px; }
.lobe-lora-badge.incompatible { color: var(--lobe-error-text, #ffccc7); background: var(--lobe-error-surface, #54121e); }
.lobe-lora-badge.weight { color: var(--lobe-primary-contrast, var(--lobe-tools-on-primary, #fff)); background: var(--color-accent, var(--lobe-tools-primary, #1677ff)); }
.card:hover .lobe-lora-badge.weight { display: none; }
.lobe-lora-controls { display: flex; gap: 2px; align-items: center; justify-content: center; width: fit-content; margin: 0 auto 4px; padding: 1px; background: rgb(0 0 0 / 55%); border-radius: 8px; }
.card:hover .lobe-lora-controls { display: flex; }
.lobe-lora-controls button { display: flex; align-items: center; justify-content: center; min-width: 20px; height: 22px; padding: 0 4px; font-size: 14px; line-height: 1; color: #fff; cursor: pointer; background: transparent; border: none; border-radius: 6px; }
.lobe-lora-controls button:hover { background: rgb(255 255 255 / 18%); }
.lobe-lora-controls .value { min-width: 30px; font-size: 12px; font-variant-numeric: tabular-nums; cursor: ns-resize; }
.lobe-lora-controls .value.custom { color: var(--lobe-tools-primary-light, #69b1ff); font-weight: 600; }
.lobe-lora-filter { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 0 16px 8px; }
.lobe-lora-filter button { padding: 2px 10px; font-size: 12px; line-height: 20px; color: var(--body-text-color, inherit); cursor: pointer; background: var(--lobe-tools-fill, rgb(128 128 128 / 12%)); border: 1px solid transparent; border-radius: 999px; }
.lobe-lora-filter button:hover { border-color: var(--lobe-tools-primary, #1677ff); }
.lobe-lora-filter button.active { color: var(--lobe-accent-text); background: var(--lobe-field); }
.lobe-lora-filter button svg { vertical-align: -0.18em; margin-inline-end: 4px; }
.lobe-lora-filter .count { margin-left: auto; font-size: 12px; opacity: 0.6; }
.lobe-lora-star:focus-visible, .lobe-lora-controls button:focus-visible { outline: 2px solid var(--lobe-tools-primary); outline-offset: 2px; }
@media (pointer: coarse) { .lobe-lora-star { width: 44px; height: 44px; } .lobe-lora-controls button { min-width: 40px; height: 44px; } }
`;

const round = (value: number) => Math.round(value * 100) / 100;
const clamp = (value: number) => Math.min(5, Math.max(-5, value));

const cardName = (card: HTMLElement) => card.dataset.name || '';

const tabOfContainer = (container: Element): GenTab =>
  container.id.startsWith('img2img') ? 'img2img' : 'txt2img';

export const startLoraTools = ({
  colors,
  text,
}: {
  colors: { fill: string; primary: string; primaryLight: string };
  text: LoraToolsText;
}) => {
  let infos = new Map<string, LoraInfo>();
  let favorites = new Set<string>();
  let recent: string[] = [];
  let modelArch: Arch = 'unknown';
  const filters = new Map<string, Filter>();
  let refetched = false;
  let disposed = false;

  const style = document.createElement('style');
  style.id = 'lobe-lora-tools-style';
  style.textContent = CSS;
  document.head.append(style);
  document.documentElement.style.setProperty('--lobe-tools-primary', colors.primary);
  document.documentElement.style.setProperty(
    '--lobe-tools-on-primary',
    readableColor(colors.primary, '#111', '#fff', false),
  );
  document.documentElement.style.setProperty('--lobe-tools-primary-light', colors.primaryLight);
  document.documentElement.style.setProperty('--lobe-tools-fill', colors.fill);

  /** Change a LoRA's weight, and its tag in the prompt if it is there. */
  const changeWeight = (card: HTMLElement, weight: number | undefined) => {
    const name = cardName(card);
    setWeight(name, weight === undefined ? undefined : round(clamp(weight)));
    const value = weight === undefined ? defaultWeight() : round(clamp(weight));
    const alias = infos.get(name)?.alias || cardAlias(card) || name;
    const container = card.closest(CONTAINERS);
    const box = container ? promptBox(tabOfContainer(container)) : null;
    if (box) {
      const pattern = loraTagPattern(alias);
      if (pattern.test(box.value)) {
        setInputValue(
          box,
          box.value.replace(
            loraTagPattern(alias),
            (_m, _w, rest) => `<lora:${alias}:${formatWeight(value)}${rest}>`,
          ),
        );
      }
    }
    // Keep the hovered wheel target in place. Rebuilding the controls on each
    // tick both retargets scrolling and wakes every native DOM-update callback.
    const control = card.querySelector<HTMLButtonElement>('.lobe-lora-controls .value');
    if (control) {
      const custom = value !== defaultWeight();
      control.textContent = formatWeight(value);
      control.classList.toggle('custom', custom);
      let badge = card.querySelector<HTMLElement>('.lobe-lora-badge.weight');
      if (!custom) badge?.remove();
      else {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'lobe-lora-badge weight';
          card.querySelector('.lobe-lora-corner')?.append(badge);
        }
        badge.textContent = formatWeight(value);
      }
    }
  };

  function onWheel(event: WheelEvent) {
    if (event.ctrlKey || !event.deltaY) return; // preserve browser zoom and horizontal scrolling
    const target = event.target as HTMLElement;
    if (!target.closest('.lobe-lora-controls .value')) return;
    const card = target.closest<HTMLElement>(`${CONTAINERS} .card`);
    if (!card) return;
    event.preventDefault();
    changeWeight(card, weightOf(cardName(card)) + (event.deltaY < 0 ? 0.05 : -0.05));
  }

  const renderCard = (card: HTMLElement) => {
    const name = cardName(card);
    if (!name) return;
    const info = infos.get(name);
    card.dataset.lobeLora = name;
    card.querySelector('.lobe-lora-corner')?.remove();
    card.querySelector('.lobe-lora-controls')?.remove();

    const corner = document.createElement('div');
    corner.className = 'lobe-lora-corner';
    corner.dataset.lobeLocalized = '';
    const star = document.createElement('button');
    star.type = 'button';
    star.className = 'lobe-lora-star' + (favorites.has(name) ? ' active' : '');
    star.title = text.favorite;
    star.setAttribute('aria-label', text.favorite);
    star.setAttribute('aria-pressed', String(favorites.has(name)));
    star.innerHTML = STAR;
    star.dataset.action = 'favorite';
    corner.append(star);
    const archLabel = info ? ARCH_LABEL[info.arch] : '';
    if (archLabel) {
      const badge = document.createElement('span');
      badge.className =
        'lobe-lora-badge' + (isCompatible(info?.arch, modelArch) ? '' : ' incompatible');
      badge.textContent = archLabel;
      corner.append(badge);
    }
    const weight = weightOf(name);
    const custom = weight !== defaultWeight();
    if (custom) {
      const badge = document.createElement('span');
      badge.className = 'lobe-lora-badge weight';
      badge.textContent = formatWeight(weight);
      corner.append(badge);
    }

    const controls = document.createElement('div');
    controls.className = 'lobe-lora-controls';
    controls.dataset.lobeLocalized = '';
    controls.innerHTML =
      `<button type="button" data-action="minus" title="${text.weight} −0.1">${svgIcon(Minus, 15)}</button>` +
      `<button type="button" class="value${custom ? ' custom' : ''}" data-action="reset" title="${text.weight}">${formatWeight(weight)}</button>` +
      `<button type="button" data-action="plus" title="${text.weight} +0.1">${svgIcon(Plus, 15)}</button>`;
    // A document-level cancelable wheel listener makes every page scroll wait
    // for the main thread. Only the tiny weight control needs interception.
    controls
      .querySelector('.value')
      ?.addEventListener('wheel', onWheel as EventListener, { passive: false });
    if (info?.triggerWords?.length) {
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.dataset.action = 'trigger';
      trigger.title = `${text.triggerWords}: ${info.triggerWords.join(', ')}`;
      trigger.innerHTML = TAG;
      controls.append(trigger);
    }
    // in the name block at the bottom, so the picture stays one big click target
    const actions = card.querySelector('.actions');
    if (actions) actions.prepend(controls);
    else card.append(controls);
    card.append(corner);
  };

  const applyFilter = (container: HTMLElement) => {
    const filter = filters.get(container.id) || 'all';
    const cards = [...container.querySelectorAll<HTMLElement>('.card')];
    const accept = (card: HTMLElement) => {
      const name = cardName(card);
      return filter === 'favorites'
        ? favorites.has(name)
        : filter === 'recent'
          ? recent.includes(name)
          : filter === 'compatible'
            ? isCompatible(infos.get(name)?.arch, modelArch)
            : true;
    };
    const indexed = setNetworkPredicate(
      container,
      accept,
      filter === 'recent' ? (card) => recent.indexOf(cardName(card)) : undefined,
    );
    let shown = 0;
    for (const card of cards) {
      const name = cardName(card);
      let visible = true;
      switch (filter) {
        case 'favorites': {
          visible = favorites.has(name);
          break;
        }
        case 'recent': {
          visible = recent.includes(name);
          break;
        }
        case 'compatible': {
          {
            visible = isCompatible(infos.get(name)?.arch, modelArch);
            // No default
          }
          break;
        }
      }
      card.classList.toggle('lobe-lora-hidden', !indexed && !visible);
      card.style.order = filter === 'recent' && visible ? String(recent.indexOf(name)) : '';
      if (visible && card.style.display !== 'none') shown++;
    }
    const bar = container.parentElement?.querySelector(
      `.lobe-lora-filter[data-container="${container.id}"]`,
    );
    if (bar?.classList.contains('lobe-lora-filter')) {
      for (const button of bar.querySelectorAll<HTMLButtonElement>('button[data-filter]')) {
        const active = button.dataset.filter === filter;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      }
      const archButton = bar.querySelector('button[data-filter="compatible"] > span');
      if (archButton) {
        const label = ARCH_LABEL[modelArch];
        archButton.textContent = label ? `${text.compatible} · ${label}` : text.compatible;
      }
      const count = bar.querySelector('.count');
      if (count)
        count.textContent = indexed || filter === 'all' ? '' : `${shown} / ${cards.length}`;
    }
  };

  const refreshAll = () => {
    for (const card of document.querySelectorAll<HTMLElement>(`${CONTAINERS} .card`))
      renderCard(card);
    for (const container of document.querySelectorAll<HTMLElement>(CONTAINERS))
      applyFilter(container);
  };

  const ensureBar = (container: HTMLElement) => {
    if (
      container.parentElement?.querySelector(`.lobe-lora-filter[data-container="${container.id}"]`)
    )
      return;
    const bar = document.createElement('div');
    bar.className = 'lobe-lora-filter';
    bar.dataset.lobeLocalized = '';
    bar.dataset.container = container.id;
    const items: [Filter, string, string][] = [
      ['all', text.all, layoutGrid],
      ['favorites', text.favorites, Star],
      ['recent', text.recent, history],
      ['compatible', text.compatible, cpu],
    ];
    for (const [filter, label, icon] of items) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.filter = filter;
      button.innerHTML = svgIcon(icon, 14);
      const caption = document.createElement('span');
      caption.textContent = label;
      button.append(caption);
      bar.append(button);
    }
    const count = document.createElement('span');
    count.className = 'count';
    bar.append(count);
    bar.addEventListener('click', async (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        'button[data-filter]',
      );
      if (!button) return;
      const lists = await loadLoraLists();
      if (disposed) return;
      favorites = new Set(lists.favorites);
      recent = lists.recent;
      const filter = button.dataset.filter as Filter;
      filters.set(container.id, filter);
      if (filter === 'compatible') {
        modelArch = await currentArch();
        refreshAll();
      }
      applyFilter(container);
    });
    container.before(bar);
  };

  const decorate = () => {
    let missing = false;
    for (const container of document.querySelectorAll<HTMLElement>(CONTAINERS)) {
      ensureBar(container);
      for (const card of container.querySelectorAll<HTMLElement>('.card')) {
        const name = cardName(card);
        if (card.dataset.lobeLora === name && card.querySelector('.lobe-lora-corner')) continue;
        if (name && !infos.has(name)) missing = true;
        renderCard(card);
      }
      // Filter refreshes happen only on a user action or model change; decorating a page never restarts pagination.
    }
    // cards for LoRAs added since the list was fetched (WebUI refresh button)
    if (missing && !refetched) {
      refetched = true;
      loadLoras(true).then((map) => {
        if (disposed) return;
        infos = map;
        refreshAll();
        setTimeout(() => {
          refetched = false;
        }, 5000);
      });
    }
  };


  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const card = target.closest<HTMLElement>(`${CONTAINERS} .card`);
    if (!card) return;
    const actionElement = target.closest<HTMLElement>('[data-action]');
    const action =
      actionElement && card.contains(actionElement) ? actionElement.dataset.action : undefined;
    const name = cardName(card);
    if (action) {
      // a theme control on the card: keep the WebUI's card click from running
      event.stopPropagation();
      event.preventDefault();
      switch (action) {
        case 'favorite': {
          toggleFavorite(name).then((isFavorite) => {
            if (isFavorite) favorites.add(name);
            else favorites.delete(name);
            renderCard(card);
            const container = card.closest<HTMLElement>(CONTAINERS);
            if (container) applyFilter(container);
          });

          break;
        }
        case 'minus': {
          changeWeight(card, weightOf(name) - 0.1);

          break;
        }
        case 'plus': {
          changeWeight(card, weightOf(name) + 0.1);

          break;
        }
        case 'reset': {
          changeWeight(card, undefined);

          break;
        }
        case 'trigger': {
          const words = infos.get(name)?.triggerWords || [];
          const container = card.closest(CONTAINERS);
          if (words.length > 0 && container) {
            const tab = tabOfContainer(container);
            const current = promptBox(tab)?.value.toLowerCase() || '';
            const missingWords = words.filter((word) => !current.includes(word.toLowerCase()));
            if (missingWords.length > 0) appendToPrompt(tab, missingWords.join(', '));
          }

          break;
        }
        // No default
      }
      return;
    }
    // A plain card click: the WebUI inserts the tag with the default
    // multiplier, read from `opts` when the click runs. Use this LoRA's
    // weight for that one click.
    pushRecent(name).then(() => {
      if (disposed) return;
      recent = [name, ...recent.filter((item) => item !== name)].slice(0, 40);
      const container = card.closest<HTMLElement>(CONTAINERS);
      if (container && filters.get(container.id) === 'recent') applyFilter(container);
    });
    const weight = weightOf(name);
    const alias = infos.get(name)?.alias || cardAlias(card) || name;
    const container = card.closest(CONTAINERS);
    // Preserve Forge's own insertion/toggle and activation text, then use the
    // displayed weight even when the native card has a literal preferred weight.
    setTimeout(() => {
      if (disposed || !container) return;
      const tab = tabOfContainer(container);
      for (const box of [promptBox(tab), negativeBox(tab)]) {
        if (box && loraTagPattern(alias).test(box.value)) {
          setInputValue(
            box,
            box.value.replace(
              loraTagPattern(alias),
              (_m, _w, rest) => `<lora:${alias}:${formatWeight(weight)}${rest}>`,
            ),
          );
        }
      }
    }, 0);
  };


  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      decorate();
    }, 250);
  };
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type !== 'childList' || !record.addedNodes.length || isPromptOutputMutation(record)) continue;
      if (record.target instanceof HTMLElement && record.target.closest('[id$="_results"], [id$="_settings"]')) {
        continue;
      }
      for (const node of record.addedNodes) {
        if (
          node instanceof HTMLElement &&
          (node.matches?.('.card, [id$="_lora_cards"]') || node.querySelector?.('.card'))
        ) {
          schedule();
          return;
        }
      }
    }
  });

  document.addEventListener('click', onClick, true);

  Promise.all([loadLoras(), loadLoraLists(), currentArch()]).then(([map, lists, arch]) => {
    if (disposed) return;
    infos = map;
    favorites = new Set(lists.favorites);
    recent = lists.recent;
    modelArch = arch;
    decorate();
    // the theme moves the extra-network panes into its sidebar, outside #tabs
    observer.observe(document.body, { childList: true, subtree: true });
  });

  // badges and the "compatible" filter follow Forge's UI preset as it changes
  const modelChanged = async (event: Event) => {
    if (
      !(event.target instanceof HTMLElement) ||
      !event.target.closest('#setting_sd_model_checkpoint,#forge_ui_preset')
    )
      return;
    modelArch = await currentArch();
    if (!disposed) refreshAll();
  };
  document.addEventListener('change', modelChanged);

  return () => {
    observer.disconnect();
    disposed = true;
    document.removeEventListener('change', modelChanged);
    for (const container of document.querySelectorAll<HTMLElement>(CONTAINERS))
      setNetworkPredicate(container);
    document.removeEventListener('click', onClick, true);
    for (const control of document.querySelectorAll('.lobe-lora-controls .value'))
      control.removeEventListener('wheel', onWheel as EventListener);
    style.remove();
    for (const element of document.querySelectorAll(
      '.lobe-lora-corner, .lobe-lora-controls, .lobe-lora-filter',
    ))
      element.remove();
  };
};
