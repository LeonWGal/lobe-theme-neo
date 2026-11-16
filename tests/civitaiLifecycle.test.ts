import { afterEach, describe, expect, it, vi } from 'vitest';

import civitaiHelperFix from '@/scripts/civitaiHelperFix';

const card = (name: string) =>
  `<div class="card" data-name="${name}"><div class="actions"><div class="additional"><span class="search_term">${name}</span></div></div></div>`;
let cleanup: (() => void) | undefined;
afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.useRealTimers();
});

describe('Civitai card integration', () => {
  it('enhances cards added after initial loading without polling or duplicate actions', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = `<div id="tab_civitai_helper"></div><div id="txt2img_lora_cards" class="extra-network-cards">${card('first')}</div>`;
    const interval = vi.spyOn(window, 'setInterval');
    cleanup = civitaiHelperFix();
    expect(document.querySelectorAll('.card a')).toHaveLength(4);
    document.querySelector('#txt2img_lora_cards')!.insertAdjacentHTML('beforeend', card('second'));
    await vi.advanceTimersByTimeAsync(240);
    expect(document.querySelectorAll('.card a')).toHaveLength(8);
    expect(civitaiHelperFix()).toBe(cleanup);
    await vi.advanceTimersByTimeAsync(240);
    expect(document.querySelectorAll('.card a')).toHaveLength(8);
    expect(interval).not.toHaveBeenCalled();
    interval.mockRestore();
  });
  it('disconnects the observer when the sidebar unmounts', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = `<div id="tab_civitai_helper"></div><div id="txt2img_lora_cards" class="extra-network-cards">${card('first')}</div>`;
    cleanup = civitaiHelperFix();
    cleanup();
    cleanup = undefined;
    document.querySelector('#txt2img_lora_cards')!.insertAdjacentHTML('beforeend', card('second'));
    await vi.advanceTimersByTimeAsync(500);
    expect(document.querySelectorAll('.card a')).toHaveLength(4);
  });
});
