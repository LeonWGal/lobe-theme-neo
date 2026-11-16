import { isPromptOutputMutation } from '@/utils/promptMutations';
import { ChevronLeft, ChevronRight, svgIcon } from '@/icons/native';

import { mountNativeNetworkFolders, mountNetworkFolders, mountNetworkLocation } from './networkFolders';

const PAGE_SIZE = 60;
const LARGE_LIST = 120;
const FOLDER_SELECTOR = '.extra-network-dirs[id$="_dirs"], [id$="_lora_dirs"]';
const CARD_SELECTOR = '.extra-network-cards[id$="_cards"]';
const PANE_CONTROLS_SELECTOR = '.extra-network-pane > .extra-network-control';
const NATIVE_TREE_SELECTOR = '.extra-network-pane .extra-network-tree';
const predicates = new Map<string, {accept: (_card: HTMLElement)=>boolean; rank?: (_card: HTMLElement)=>number}>();
const refreshers = new Map<string, ()=>void>();

/** Apply tool filters to every indexed card before slicing a visible page. */
export function setNetworkPredicate(container: HTMLElement, accept?: (card: HTMLElement)=>boolean, rank?: (card: HTMLElement)=>number) {
  if(accept) predicates.set(container.id,{accept,rank});
  else predicates.delete(container.id);
  const refresh=refreshers.get(container.id);
  refresh?.();
  return Boolean(refresh);
}

declare const extraNetworksApplyFilter: Record<string, (_force?: boolean) => void>;
declare const extraNetworksApplySort: Record<string, (_force?: boolean) => void>;
declare const opts: { lora_filter_disabled?: boolean };

interface CardRecord {
  element: HTMLElement;
  search: string;
  searchOnly: boolean;
  version: string | null | undefined;
}

const maps = () => ({
  filter: typeof extraNetworksApplyFilter === 'undefined' ? undefined : extraNetworksApplyFilter,
  sort: typeof extraNetworksApplySort === 'undefined' ? undefined : extraNetworksApplySort,
});

/** Keep native cards and their handlers, but only attach one page to the live DOM. */
export function paginateNetworks(
  root: ParentNode,
  labels: {
    all: string;
    folder: string;
    next: string;
    openFolder?: string;
    previous: string;
    toggleFolder?: string;
  },
) {
  const lists = new Map<HTMLElement, ReturnType<typeof createList>>();
  const folderLists = new Map<HTMLElement, () => void>();
  let frame = 0;

  function createList(container: HTMLElement) {
    const id = container.id.replace(/_cards$/, '');
    const search = root.querySelector<HTMLInputElement>(`#${id}_extra_search`);
    const cards: CardRecord[] = [...container.querySelectorAll<HTMLElement>(':scope > .card')].map(
      (element) => ({
        element,
        search: [...element.querySelectorAll('.search_terms, .description')]
          .map((e) => e.textContent?.toLowerCase() || '')
          .join(' '),
        searchOnly: Boolean(element.querySelector('.search_only')),
        version: element.dataset.sortSdversion,
      }),
    );
    const parked = document.createDocumentFragment();
    const owned = new Set(cards.map((card) => card.element));
    const controls = document.createElement('div');
    controls.className = 'lobe-network-pagination';
    controls.dataset.lobeNetworkPage = id;
    const previous = document.createElement('button');
    const next = document.createElement('button');
    const status = document.createElement('output');
    previous.type = next.type = 'button';
    previous.innerHTML = svgIcon(ChevronLeft);
    next.innerHTML = svgIcon(ChevronRight);
    previous.setAttribute('aria-label', labels.previous);
    next.setAttribute('aria-label', labels.next);
    status.setAttribute('aria-live', 'polite');
    controls.append(previous, status, next);
    container.before(controls);
    let page = 0;
    let filtered = cards;
    let disposed = false;
    let inputTimer: ReturnType<typeof setTimeout> | undefined;
    const native = {
      filter: undefined as ((force?: boolean) => void) | undefined,
      sort: undefined as ((force?: boolean) => void) | undefined,
    };

    const render = () => {
      page = Math.max(0, Math.min(page, Math.ceil(filtered.length / PAGE_SIZE) - 1));
      // Moving nodes preserves inline Forge/Civitai actions and edited metadata.
      // querySelectorAll is a snapshot; children is live and skips moved nodes.
      for (const card of container.querySelectorAll(':scope > .card')) parked.append(card);
      const fragment = document.createDocumentFragment();
      filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).forEach((card) => {
        card.element.classList.remove('hidden');
        fragment.append(card.element);
      });
      container.append(fragment);
      previous.disabled = page === 0;
      next.disabled = (page + 1) * PAGE_SIZE >= filtered.length;
      status.value = `${filtered.length ? page * PAGE_SIZE + 1 : 0}–${Math.min((page + 1) * PAGE_SIZE, filtered.length)} / ${filtered.length.toLocaleString()}`;
      container.dataset.lobeCardCount = String(cards.length);
    };
    const sort = () => {
      const control = root.querySelector<HTMLElement>(
        `#${id}_controls .extra-network-control--sort.extra-network-control--enabled`,
      );
      const key = control?.dataset.sortkey || 'default';
      const field = `sort${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      const descending =
        root.querySelector<HTMLElement>(`#${id}_extra_sort_dir`)?.dataset.sortdir === 'Descending';
      filtered.sort((a, b) => {
        const rank=predicates.get(container.id)?.rank;
        if(rank) return rank(a.element)-rank(b.element);
        const x = a.element.dataset[field] || '';
        const y = b.element.dataset[field] || '';
        const order =
          x !== '' && y !== '' && !Number.isNaN(Number(x)) && !Number.isNaN(Number(y))
            ? Number(x) - Number(y)
            : x < y
              ? -1
              : x > y
                ? 1
                : 0;
        return descending ? -order : order;
      });
      page = 0;
      render();
    };
    const filter = () => {
      clearTimeout(inputTimer);
      inputTimer = undefined;
      container.removeAttribute('aria-busy');
      const term = search?.value.toLowerCase() || '';
      const parts = term.split(/\s+/).filter(Boolean);
      const preset = [
        ...root.querySelectorAll<HTMLInputElement>('#forge_ui_preset input'),
      ].findIndex((input) => input.checked);
      const versions = ['SdVersion.SD1', 'SdVersion.SDXL', 'SdVersion.Flux'];
      const skipVersion = typeof opts !== 'undefined' && opts.lora_filter_disabled;
      filtered = cards.filter(
        (card) =>
          (!card.searchOnly || term.length >= 4) &&
          parts.every((part) => card.search.includes(part)) &&
          (predicates.get(container.id)?.accept(card.element) ?? true) &&
          (skipVersion ||
            preset < 0 ||
            preset >= versions.length ||
            !card.version ||
            card.version === 'SdVersion.Unknown' ||
            card.version === versions[preset]),
      );
      sort();
    };
    const input = (event: Event) => {
      if (event.target !== search) return;
      // The native listener scans attached nodes only. This index includes every page.
      event.stopImmediatePropagation();
      clearTimeout(inputTimer);
      container.setAttribute('aria-busy', 'true');
      // Keep typing responsive; Forge runs extension callbacks after card DOM changes.
      inputTimer = setTimeout(filter, 100);
    };
    search?.addEventListener('input', input, true);
    const turnPage = (delta: number) => {
      page += delta;
      render();
      const body = container.closest<HTMLElement>('.lobe-extra-network-body');
      if (body) body.scrollTop = 0;
    };
    previous.onclick = () => turnPage(-1);
    next.onclick = () => turnPage(1);

    const hookNative = () => {
      const handlers = maps();
      for (const [name, handler] of [
        ['filter', filter],
        ['sort', sort],
      ] as const) {
        const map = handlers[name];
        if (map && map[id] !== handler) {
          native[name] = map[id];
          map[id] = handler;
        }
      }
    };
    hookNative();
    refreshers.set(container.id,filter);
    filter();
    return {
      dispose: (restore: boolean) => {
        if (disposed) return;
        disposed = true;
        refreshers.delete(container.id);
        clearTimeout(inputTimer);
        container.removeAttribute('aria-busy');
        search?.removeEventListener('input', input, true);
        const handlers = maps();
        for (const [name, handler] of [
          ['filter', filter],
          ['sort', sort],
        ] as const)
          if (handlers[name]?.[id] === handler) {
            if (native[name]) handlers[name]![id] = native[name]!;
            else delete handlers[name]![id];
          }
        controls.remove();
        if (restore) {
          cards.forEach((card) => {
            card.element.classList.remove('hidden');
            container.append(card.element);
          });
          delete container.dataset.lobeCardCount;
          native.filter?.(true);
        }
      },
      hookNative,
      owns: (element: Element) => owned.has(element as HTMLElement),
      replace: (element: HTMLElement) => {
        const old = cards.find((card) => card.element.dataset.name === element.dataset.name);
        const record = old || { element, search: '', searchOnly: false, version: null };
        if (old) {
          owned.delete(old.element);
          old.element.remove();
        } else cards.push(record);
        record.element = element;
        record.search = [...element.querySelectorAll('.search_terms, .description')]
          .map((e) => e.textContent?.toLowerCase() || '')
          .join(' ');
        record.searchOnly = Boolean(element.querySelector('.search_only'));
        record.version = element.dataset.sortSdversion;
        owned.add(element);
        filter();
      },
    };
  }

  const scan = () => {
    frame = 0;
    lists.forEach((list, element) => {
      if (!element.isConnected) {
        list.dispose(false);
        lists.delete(element);
      } else list.hookNative();
    });
    for (const [element, restore] of folderLists) {
      if (element.isConnected) continue;
      restore();
      folderLists.delete(element);
    }
    for (const element of root.querySelectorAll<HTMLElement>(FOLDER_SELECTOR)) {
      if (folderLists.has(element) || !element.querySelector(':scope > button:not(.search-all)')) continue;
      if (element.id.endsWith('_lora_dirs') || element.children.length > LARGE_LIST) {
        folderLists.set(element, mountNetworkFolders(element, labels));
      }
    }
    for (const controls of root.querySelectorAll<HTMLElement>(PANE_CONTROLS_SELECTOR)) {
      if (!folderLists.has(controls))
        folderLists.set(controls, mountNetworkLocation(controls, labels.all));
    }
    for (const tree of root.querySelectorAll<HTMLElement>(NATIVE_TREE_SELECTOR)) {
      if (!folderLists.has(tree))
        folderLists.set(tree, mountNativeNetworkFolders(tree, labels));
    }
    for (const container of root.querySelectorAll<HTMLElement>(CARD_SELECTOR)) {
      if (lists.has(container)) continue;
      if (container.querySelectorAll(':scope > .card').length > LARGE_LIST)
        lists.set(container, createList(container));
    }
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(scan);
  };
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (isPromptOutputMutation(mutation)) continue;
      const list = lists.get(mutation.target as HTMLElement);
      if (list)
        for (const node of mutation.addedNodes)
          if (node instanceof HTMLElement && node.classList.contains('card') && !list.owns(node))
            list.replace(node);
      if (
        [...mutation.addedNodes, ...mutation.removedNodes].some(
          (node) =>
            node instanceof Element &&
            (node.matches(CARD_SELECTOR) || node.querySelector(CARD_SELECTOR) ||
              node.matches(FOLDER_SELECTOR) || node.querySelector(FOLDER_SELECTOR) ||
              node.matches(PANE_CONTROLS_SELECTOR) || node.querySelector(PANE_CONTROLS_SELECTOR) ||
              node.matches(NATIVE_TREE_SELECTOR) || node.querySelector(NATIVE_TREE_SELECTOR) ||
              node.matches('button') && mutation.target instanceof HTMLElement &&
                mutation.target.matches(FOLDER_SELECTOR)),
        )
      ) {
        schedule();
      }
    }
  });
  observer.observe(root, { childList: true, subtree: true });
  scan();
  // Forge installs its callback maps shortly after the initial HTML arrives.
  const readyTimer = setTimeout(scan, 1000);
  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    clearTimeout(readyTimer);
    lists.forEach((list) => list.dispose(true));
    folderLists.forEach((restore) => restore());
  };
}
