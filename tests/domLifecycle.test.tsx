import { act, fireEvent, render, renderHook, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { refreshExtraNetwork } from '@/features/ExtraNetworkSidebar/refreshExtraNetwork';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { useInject } from '@/hooks/useInject';
import { useNetworkCardAccessibility } from '@/hooks/useNetworkCardAccessibility';

const Host = () => {
  const ref = useRef<HTMLDivElement>(null);
  useInject(ref, '#native', { id: 'moved' });
  return <div data-testid="host" ref={ref} />;
};

afterEach(() => {
  vi.useRealTimers();
});
describe('Gradio integration lifecycle', () => {
  it('restores native position and id on unmount', async () => {
    document.body.innerHTML =
      '<section id="original"><div id="native">content</div><b>after</b></section>';
    const view = render(<Host />);
    await waitFor(() => expect(view.getByTestId('host').querySelector('#moved')).toBeTruthy());
    view.unmount();
    expect(document.querySelector('#original')?.firstElementChild?.id).toBe('native');
    expect(document.querySelector('#original')?.textContent).toBe('contentafter');
  });
  it('can inject native content that appears after the loading timeout', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<section id="original"></section>';
    const view = render(<Host />);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    await act(async () => {
      const target = document.createElement('div');
      target.id = 'native';
      document.querySelector('#original')!.append(target);
    });
    expect(view.getByTestId('host').querySelector('#moved')).toBeTruthy();
    view.unmount();
  });
  it('updates unload protection without depending on footer visibility', () => {
    const hook = renderHook(({ enabled }) => useBeforeUnload(enabled), {
      initialProps: { enabled: false },
    });
    const event = () => new Event('beforeunload', { cancelable: true });
    const off = event();
    window.dispatchEvent(off);
    expect(off.defaultPrevented).toBe(false);
    hook.rerender({ enabled: true });
    const on = event();
    window.dispatchEvent(on);
    expect(on.defaultPrevented).toBe(true);
    hook.rerender({ enabled: false });
    const disabled = event();
    window.dispatchEvent(disabled);
    expect(disabled.defaultPrevented).toBe(false);
    hook.unmount();
  });
  it('preserves the selected LoRA tab during refresh', () => {
    vi.useFakeTimers();
    document.body.innerHTML =
      '<div id="txt2img_extra_tabs"><div class="tab-nav"><button>Generation</button>' +
      '<button>Embeddings</button><button class="selected">LoRA</button></div>' +
      '<div class="extra-network-pane"><div class="card"></div></div></div>';
    const first = vi.fn();
    document.querySelectorAll('button')[1].onclick = first;
    refreshExtraNetwork('txt');
    vi.advanceTimersByTime(2000);
    expect(first).not.toHaveBeenCalled();
  });
  it('makes native cards keyboard operable and restores attributes', () => {
    document.body.innerHTML =
      '<div class="extra-network-cards"><div class="card" onclick="" data-name="LoRA"></div></div>';
    const card = document.querySelector<HTMLElement>('.card')!;
    const clicked = vi.fn();
    card.onclick = clicked;
    const hook = renderHook(useNetworkCardAccessibility);
    expect(card.tabIndex).toBe(0);
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(clicked).toHaveBeenCalledTimes(1);
    hook.unmount();
    expect(card.hasAttribute('tabindex')).toBe(false);
  });
});
