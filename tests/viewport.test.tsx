import { act, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { useOverlaySidebars } from '@/hooks/useOverlaySidebars';
import { useAppStore } from '@/store';

it('shares one resize subscription and coalesces events before updating responsive layout', () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
  const frames: FrameRequestCallback[] = [];
  const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  const added = vi.spyOn(window, 'addEventListener');
  const view = renderHook(() => [useOverlaySidebars(), useOverlaySidebars()]);
  expect(added.mock.calls.filter(([name]) => name === 'resize')).toHaveLength(1);
  expect(view.result.current[0].compact).toBe(false);
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 768 });
  act(() => {
    for (let i = 0; i < 10; i++) window.dispatchEvent(new Event('resize'));
  });
  expect(raf).toHaveBeenCalledTimes(1);
  act(() => frames[0](0));
  expect(view.result.current.map((panel) => panel.compact)).toEqual([true, true]);
  expect(view.result.current[0].compact).toBe(true);
  view.unmount();
  added.mockRestore();
  raf.mockRestore();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1920 });
});

it('uses edge panels at tablet width while retaining the narrow mobile drawer', () => {
  const setting = useAppStore.getState().setting;
  useAppStore.setState({
    setting: { ...setting, extraNetworkFixedMode: 'float', sidebarFixedMode: 'float' },
  });
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
  const view = renderHook(useOverlaySidebars);
  expect(view.result.current.overlay).toBe(false);
  view.unmount();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  const mobile = renderHook(useOverlaySidebars);
  expect(mobile.result.current.overlay).toBe(true);
  expect(mobile.result.current.compact).toBe(true);
  mobile.unmount();
  useAppStore.setState({ setting });
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1920 });
});

it('does not rerender React consumers for pixel changes inside a layout mode', () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1800 });
  const frames: FrameRequestCallback[] = [];
  const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  let renders = 0;
  const view = renderHook(() => { renders++; return useOverlaySidebars(); });
  for (let value = 1799; value >= 1750; value--) {
    act(() => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value });
      window.dispatchEvent(new Event('resize'));
      frames.at(-1)!(0);
    });
  }
  expect(renders).toBe(1);
  act(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    window.dispatchEvent(new Event('resize'));
    frames.at(-1)!(0);
  });
  expect(renders).toBe(2);
  expect(view.result.current.compact).toBe(true);
  view.unmount();
  expect(document.documentElement.dataset.lobeResizing).toBeUndefined();
  raf.mockRestore();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1920 });
});
