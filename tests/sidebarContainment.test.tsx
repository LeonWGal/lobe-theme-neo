import { act, render } from '@testing-library/react';
import { useEffect } from 'react';
import { expect, it, vi } from 'vitest';

import ThemeSidebar from '@/components/ThemeSidebar';
import { useAppStore } from '@/store';

vi.mock('@lobehub/ui', () => ({
  ActionIcon: ({ className, onClick, 'aria-label': label }: any) => <button aria-label={label} className={className} onClick={onClick} type="button" />,
  DraggablePanelContent: ({ children }: any) => <div>{children}</div>,
  DraggablePanelHandle: () => null,
  DraggablePanelRoot: ({ children, className }: any) => <aside className={className}>{children}</aside>,
  DraggablePanelToggle: () => null,
}));
vi.mock('antd-style', () => ({ useTheme: () => ({}) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it('keeps controls inside gradio-app and preserves the mounted content across responsive modes', () => {
  const initial = useAppStore.getState();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
  const frames: FrameRequestCallback[] = [];
  const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  const app = document.createElement('gradio-app');
  document.body.append(app);
  let mounts = 0;
  function NativeControls() {
    useEffect(() => { mounts++; }, []);
    return <input defaultValue="Original" id="native-network-controls" />;
  }
  useAppStore.setState({ mobileSidebar: 'none' });
  const view = render(<ThemeSidebar headerHeight={64} kind="extra" title="Networks"><NativeControls /></ThemeSidebar>, { container: app });
  const input = app.querySelector<HTMLInputElement>('#native-network-controls')!;
  input.value = 'Edited';
  const content = app.querySelector('.lobe-sidebar-content');
  for (const width of [390, 1440, 768, 1600, 390]) {
    act(() => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
      window.dispatchEvent(new Event('resize'));
      frames.at(-1)!(0);
    });
    expect(app.querySelector('#native-network-controls')).toBe(input);
    expect(app.querySelector('.lobe-sidebar-content')).toBe(content);
    expect(input.value).toBe('Edited');
  }
  act(() => useAppStore.getState().setMobileSidebar('extra'));
  expect(app.querySelector('aside')).toHaveAttribute('role', 'dialog');
  expect(app.querySelector('aside')).toHaveAttribute('aria-modal', 'true');
  expect(app.querySelector('aside')).toHaveAttribute('aria-hidden', 'false');
  expect(app.querySelector('.lobe-sidebar-mask')).not.toHaveAttribute('hidden');
  expect(document.documentElement.style.overflow).toBe('hidden');
  expect(mounts).toBe(1);
  view.unmount();
  expect(document.documentElement.style.overflow).not.toBe('hidden');
  useAppStore.setState(initial);
  app.remove();
  raf.mockRestore();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1920 });
});
