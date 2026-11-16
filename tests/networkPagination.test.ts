import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { paginateNetworks, setNetworkPredicate } from '@/utils/networkPagination';

const labels = { all: 'All', folder: 'Find folder', next: 'Next page', previous: 'Previous page' };
let cleanup: (() => void) | undefined;
const card = (i: number) =>
  `<div class="card" data-name="model-${i}" data-sort-default="${i}" data-sort-name="model-${i}"><span class="search_terms">folder-${i} model-${i}</span><span class="name">model-${i}</span></div>`;
const fixture = (count = 600) => {
  document.body.innerHTML = `<input id="txt2img_lora_extra_search"><div id="txt2img_lora_controls"><div class="extra-network-control--sort extra-network-control--enabled" data-sortkey="default"></div></div><div id="txt2img_lora_extra_sort_dir" data-sortdir="Ascending"></div><div id="txt2img_lora_dirs">${Array.from({ length: 200 }, (_, i) => `<button class="${i ? '' : 'search-all'}">${i ? `folder-${i}` : 'all'}</button>`).join('')}</div><div id="txt2img_lora_cards" class="extra-network-cards">${Array.from({ length: count }, (_, i) => card(i)).join('')}</div>`;
};
beforeEach(() => {
  vi.stubGlobal('extraNetworksApplyFilter', { txt2img_lora: vi.fn() });
  vi.stubGlobal('extraNetworksApplySort', { txt2img_lora: vi.fn() });
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    setTimeout(() => callback(0), 0),
  );
  vi.stubGlobal('cancelAnimationFrame', clearTimeout);
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  const container = document.querySelector<HTMLElement>('#txt2img_lora_cards');
  if (container) setNetworkPredicate(container);
  cleanup?.();
  cleanup = undefined;
  vi.unstubAllGlobals();
  vi.useRealTimers();
  document.body.replaceChildren();
});

it('paginates the live model grid and exposes all indexed folders', () => {
  fixture();
  cleanup = paginateNetworks(document, labels);
  expect(document.querySelectorAll('.card')).toHaveLength(60);
  expect(document.querySelector('#txt2img_lora_cards')).toHaveAttribute(
    'data-lobe-card-count',
    '600',
  );
  const folders = document.querySelector('.lobe-network-folder-tree')!;
  expect(folders.querySelectorAll('button')).toHaveLength(199);
  expect(folders.textContent).toContain('folder-199');
  document.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!.click();
  expect(document.querySelector('.card')).toHaveAttribute('data-name', 'model-60');
  expect(document.querySelector('output')!.textContent).toBe('61–120 / 600');
});

it('searches detached pages and stops the native partial-list filter', () => {
  vi.useFakeTimers();
  fixture();
  const nativeInput = vi.fn();
  const search = document.querySelector<HTMLInputElement>('#txt2img_lora_extra_search')!;
  search.addEventListener('input', nativeInput);
  cleanup = paginateNetworks(document, labels);
  search.value = 'model-599';
  search.dispatchEvent(new Event('input', { bubbles: true }));
  vi.advanceTimersByTime(100);
  expect(document.querySelectorAll('.card')).toHaveLength(1);
  expect(document.querySelector('.card')).toHaveAttribute('data-name', 'model-599');
  expect(nativeInput).not.toHaveBeenCalled();
  search.value = 'not found';
  search.dispatchEvent(new Event('input', { bubbles: true }));
  vi.advanceTimersByTime(100);
  expect(document.querySelector('output')!.textContent).toBe('0–0 / 0');
  expect(document.querySelectorAll('.card')).toHaveLength(0);
});

it('sorts the entire library through native Forge callbacks', () => {
  fixture();
  cleanup = paginateNetworks(document, labels);
  document.querySelector<HTMLElement>('#txt2img_lora_extra_sort_dir')!.dataset.sortdir =
    'Descending';
  (globalThis as any).extraNetworksApplySort.txt2img_lora(true);
  expect(document.querySelector('.card')).toHaveAttribute('data-name', 'model-599');
  expect(document.querySelectorAll('.card')).toHaveLength(60);
});

it('preserves native card actions, folder search and metadata replacement', async () => {
  vi.useFakeTimers();
  fixture();
  const folder = document.querySelector<HTMLButtonElement>(
    '#txt2img_lora_dirs button:nth-child(190)',
  )!;
  const click = vi.fn();
  folder.addEventListener('click', click);
  cleanup = paginateNetworks(document, labels);
  const folderInput = document.querySelector<HTMLInputElement>('[aria-label="Find folder"]')!;
  folderInput.value = 'folder-189';
  folderInput.dispatchEvent(new Event('change'));
  expect(click).toHaveBeenCalledTimes(1);
  const replacement = document.createElement('div');
  replacement.className = 'card';
  replacement.dataset.name = 'model-0';
  replacement.innerHTML = '<span class="search_terms">edited metadata</span>';
  const action = vi.fn();
  replacement.addEventListener('click', action);
  document.querySelector('.card')!.replaceWith(replacement);
  await Promise.resolve();
  const search = document.querySelector<HTMLInputElement>('#txt2img_lora_extra_search')!;
  search.value = 'edited';
  search.dispatchEvent(new Event('input'));
  vi.advanceTimersByTime(100);
  expect(document.querySelectorAll('.card')).toHaveLength(1);
  expect(document.querySelector('.card')).toBe(replacement);
  replacement.click();
  expect(action).toHaveBeenCalledTimes(1);
});

it('handles a native refresh and restores all cards and callbacks on cleanup', async () => {
  vi.useFakeTimers();
  fixture();
  const original = (globalThis as any).extraNetworksApplyFilter.txt2img_lora;
  cleanup = paginateNetworks(document, labels);
  document.querySelector('#txt2img_lora_cards')!.outerHTML =
    `<div id="txt2img_lora_cards" class="extra-network-cards">${Array.from({ length: 300 }, (_, i) => card(i)).join('')}</div>`;
  await vi.advanceTimersByTimeAsync(20);
  expect(document.querySelectorAll('.card')).toHaveLength(60);
  expect(document.querySelectorAll('.lobe-network-pagination')).toHaveLength(1);
  cleanup();
  cleanup = undefined;
  expect(document.querySelectorAll('.card')).toHaveLength(300);
  expect(document.querySelectorAll('#txt2img_lora_dirs > button')).toHaveLength(200);
  expect((globalThis as any).extraNetworksApplyFilter.txt2img_lora).toBe(original);
});

it('leaves small libraries unchanged', () => {
  fixture(100);
  cleanup = paginateNetworks(document, labels);
  expect(document.querySelectorAll('.card')).toHaveLength(100);
  expect(document.querySelector('.lobe-network-pagination')).toBeNull();
});

it('filters favorites and orders recent models across the complete detached library', () => {
  fixture();
  cleanup = paginateNetworks(document, labels);
  const container = document.querySelector<HTMLElement>('#txt2img_lora_cards')!;
  const recent = ['model-599', 'model-450'];
  expect(setNetworkPredicate(container, element => recent.includes(element.dataset.name!), element => recent.indexOf(element.dataset.name!))).toBe(true);
  expect([...container.querySelectorAll<HTMLElement>('.card')].map(element => element.dataset.name)).toEqual(recent);
  expect(document.querySelector('output')!.textContent).toBe('1–2 / 2');
  setNetworkPredicate(container);
  expect(container.querySelectorAll('.card')).toHaveLength(60);
});

it('coalesces rapid typing into one card update after typing pauses', () => {
  vi.useFakeTimers();
  fixture();
  cleanup = paginateNetworks(document, labels);
  const container = document.querySelector<HTMLElement>('#txt2img_lora_cards')!;
  const search = document.querySelector<HTMLInputElement>('#txt2img_lora_extra_search')!;
  const update = vi.spyOn(container, 'append');
  for (let i = 0; i < 20; i++) {
    search.value = i === 19 ? 'model-599' : `model-${i}`;
    search.dispatchEvent(new Event('input'));
  }
  expect(update).not.toHaveBeenCalled();
  expect(container).toHaveAttribute('aria-busy', 'true');
  vi.advanceTimersByTime(100);
  expect(update).toHaveBeenCalledTimes(1);
  expect(container).not.toHaveAttribute('aria-busy');
  expect(document.querySelector('.card')).toHaveAttribute('data-name', 'model-599');
  expect(document.querySelectorAll('.card')).toHaveLength(1);
});

it('navigates nested LoRA folders with no card pagination', () => {
  fixture(2);
  const dirs = document.getElementById('txt2img_lora_dirs')!;
  dirs.innerHTML = '<button class="search-all">all</button><button>portraits/</button><button>portraits/studio/</button>';
  const select = vi.fn();
  dirs.lastElementChild!.addEventListener('click', select);
  cleanup = paginateNetworks(document, labels);
  const tree = dirs.querySelector('.lobe-network-folder-tree')!;
  const branch = tree.querySelector<HTMLButtonElement>('[aria-expanded]')!;
  expect(branch).toHaveAttribute('aria-label', 'Toggle subfolders: portraits');
  expect(tree.querySelector('button[title="portraits/"]')?.textContent).toBe('portraits');
  expect(tree.querySelector('button[title="portraits/studio/"]')).toBeNull();
  branch.click();
  const child = tree.querySelector<HTMLButtonElement>('button[title="portraits/studio/"]')!;
  child.click();
  expect(select).toHaveBeenCalledTimes(1);
  expect(child).toHaveAttribute('aria-current', 'true');
});

it('selects the whole Forge folder independently of expanding its children', () => {
  document.body.innerHTML = `<div class="extra-network-pane">
    <div class="extra-network-control"><input class="extra-network-control--search-text"></div>
    <div class="extra-network-tree"><div class="tree-list-content-dir" data-path="portraits/">
      <span class="tree-list-item-action--leading">▸</span><span class="tree-list-item-label">portraits</span>
    </div><ul hidden><li>studio</li></ul></div>
  </div>`;
  cleanup = paginateNetworks(document, labels);
  const search = document.querySelector<HTMLInputElement>('input')!;
  const children = document.querySelector('ul')!;
  document.querySelector<HTMLButtonElement>('button.tree-list-item-label')!.click();
  expect(search.value).toBe('portraits/');
  expect(document.querySelector('.lobe-network-location')).toHaveTextContent('portraits/');
  expect(children.hidden).toBe(true);
  document.querySelector<HTMLButtonElement>('button[aria-expanded]')!.click();
  expect(search.value).toBe('portraits/');
  expect(children.hidden).toBe(false);
});
