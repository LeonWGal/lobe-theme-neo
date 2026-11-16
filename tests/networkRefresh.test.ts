import { afterEach, expect, it, vi } from 'vitest';

import { refreshExtraNetwork } from '@/features/ExtraNetworkSidebar/refreshExtraNetwork';

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

it('coalesces opening/injection events and requests missing cards only once', () => {
  vi.useFakeTimers();
  document.body.innerHTML =
    '<div id="txt2img_extra_tabs"><div class="tab-nav"><button>Generation</button><button class="selected">Lora</button></div><div class="tabitem"><div class="extra-network-pane"><button class="search-all"></button></div></div></div>';
  const click = vi.fn();
  document.querySelector('button.search-all')!.addEventListener('click', click);
  for (let i = 0; i < 20; i++) refreshExtraNetwork('txt');
  vi.runAllTimers();
  expect(click).toHaveBeenCalledTimes(1);
});

it('does not reload loaded cards, legitimate empty results or hidden pages', () => {
  vi.useFakeTimers();
  document.body.innerHTML =
    '<div id="img2img_extra_tabs"><div class="tab-nav"><button>Generation</button><button class="selected">Lora</button></div><div class="tabitem"><div class="extra-network-pane"><div class="card"></div><button class="search-all"></button></div></div><div class="tabitem" style="display:none"><button class="search-all"></button></div></div>';
  const click = vi.fn();
  document
    .querySelectorAll('button.search-all')
    .forEach((button) => button.addEventListener('click', click));
  refreshExtraNetwork('img');
  vi.runAllTimers();
  expect(click).not.toHaveBeenCalled();
  document.querySelector('.card')!.className = 'nocards';
  refreshExtraNetwork('img');
  vi.runAllTimers();
  expect(click).not.toHaveBeenCalled();
});
