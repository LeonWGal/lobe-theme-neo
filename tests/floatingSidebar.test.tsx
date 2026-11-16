import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { createContext, useContext, useRef } from 'react';
import { type Mock, afterEach, beforeEach, expect, it, vi } from 'vitest';

import ThemeSidebar from '@/components/ThemeSidebar';
import { useFloatingSidebar } from '@/hooks/useFloatingSidebar';
import { type WebuiSetting, useAppStore } from '@/store';

vi.mock('@lobehub/ui', () => {
  const Toggle = createContext(() => {});
  return {
  ActionIcon: ({
    onClick,
    onKeyDown,
    title,
    className,
    'aria-label': label,
    'aria-pressed': pressed,
  }: any) => (
    <button
      aria-label={label}
      aria-pressed={pressed}
      className={className}
      onClick={onClick}
      onKeyDown={onKeyDown}
      title={title}
      type="button"
    />
  ),
  DraggablePanelContent: ({ children }: any) => <div>{children}</div>,
  DraggablePanelHandle: () => null,
  DraggablePanelRoot: ({ children, className, expand, onExpandChange }: any) => (
    <aside className={className}>
      <Toggle.Provider value={() => onExpandChange(!expand)}>{children}</Toggle.Provider>
    </aside>
  ),
  DraggablePanelToggle: ({ className }: any) => (
    <div className={className}><button onClick={useContext(Toggle)} type="button" /></div>
  ),
  };
});
vi.mock('antd-style', () => ({ useTheme: () => ({}) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/hooks/useOverlaySidebars', () => ({
  useOverlaySidebars: () => ({ overlay: false, viewportWidth: 1440 }),
}));

function settle() {
  return act(() => vi.advanceTimersByTime(400));
}
const original = useAppStore.getState();
let save: Mock<[Partial<WebuiSetting>], Promise<void>>;
beforeEach(() => {
  vi.useFakeTimers();
  save = vi.fn(async (patch) => {
    useAppStore.setState({ setting: { ...useAppStore.getState().setting, ...patch } });
  });
  useAppStore.setState({
    onSetSetting: save,
    setting: { ...original.setting, sidebarExpand: true, sidebarFixedMode: 'float' },
  });
});

it('shows the panel in the pointer handler and causes no React render across hover cycles', () => {
  const panel = document.createElement('aside');
  panel.className = 'lobe-sidebar-panel';
  const content = document.createElement('div');
  panel.append(content);
  document.body.append(panel);
  let renders = 0;
  const view = renderHook(() => {
    renders++;
    return useFloatingSidebar(useRef(content), true);
  });
  settle();
  expect(panel).toHaveClass('lobe-sidebar-hidden');
  for (let i = 0; i < 20; i++) {
    fireEvent.pointerEnter(panel);
    expect(panel).not.toHaveClass('lobe-sidebar-hidden');
    expect(content.getAttribute('aria-hidden')).toBe('false');
    fireEvent.pointerLeave(panel);
    settle();
  }
  expect(renders).toBe(1);
  view.unmount();
  panel.remove();
});
afterEach(() => {
  useAppStore.setState(original);
  vi.useRealTimers();
});
const renderPanel = () =>
  render(
    <ThemeSidebar headerHeight={64} kind="quick" title="Models">
      <input aria-label="Model search" />
    </ThemeSidebar>,
  );
it('reveals at the edge, delays hiding, cancels a pending leave, and never saves hover state', () => {
  const view = renderPanel();
  const panel = view.container.querySelector('aside')!;
  settle();
  expect(panel).toHaveClass('lobe-sidebar-hidden');
  fireEvent.pointerEnter(view.container.querySelector('[data-lobe-sidebar-edge]')!);
  fireEvent.pointerEnter(panel);
  expect(panel).not.toHaveClass('lobe-sidebar-hidden');
  fireEvent.pointerLeave(panel);
  act(() => vi.advanceTimersByTime(100));
  fireEvent.pointerEnter(panel);
  settle();
  expect(panel).not.toHaveClass('lobe-sidebar-hidden');
  fireEvent.pointerLeave(panel);
  settle();
  expect(panel).toHaveClass('lobe-sidebar-hidden');
  expect(save).not.toHaveBeenCalled();
  view.unmount();
});

it('keeps text editing and a drag outside the panel open until the interaction finishes', () => {
  const view = renderPanel();
  const panel = view.container.querySelector('aside')!;
  fireEvent.pointerEnter(panel);
  act(() => view.getByLabelText('Model search').focus());
  fireEvent.pointerLeave(panel);
  settle();
  expect(panel).not.toHaveClass('lobe-sidebar-hidden');
  fireEvent.pointerDown(panel);
  act(() => view.getByLabelText('Model search').blur());
  settle();
  expect(panel).not.toHaveClass('lobe-sidebar-hidden');
  fireEvent.pointerUp(document);
  settle();
  expect(panel).toHaveClass('lobe-sidebar-hidden');
  view.unmount();
});

it('preserves explicit close, exposes the arrow to reopen, and keeps pinned panels visible', async () => {
  const view = renderPanel();
  fireEvent.click(view.container.querySelector('.lobe-sidebar-close')!);
  await act(async () => {});
  expect(view.container.querySelector('[data-lobe-sidebar-edge]')).toBeNull();
  settle();
  expect(view.container.querySelector('aside')).toHaveClass('lobe-sidebar-hidden');
  fireEvent.click(view.container.querySelector('.lobe-sidebar-toggle > button')!);
  await act(async () => {});
  expect(useAppStore.getState().setting.sidebarExpand).toBe(true);
  fireEvent.keyDown(view.getByLabelText('sidebar.pin'), { key: 'Enter' });
  await act(async () => {});
  fireEvent.pointerLeave(view.container.querySelector('aside')!);
  settle();
  expect(view.container.querySelector('aside')).not.toHaveClass('lobe-sidebar-hidden');
  expect(useAppStore.getState().setting.sidebarFixedMode).toBe('fixed');
  view.unmount();
});
