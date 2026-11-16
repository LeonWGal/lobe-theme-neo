import { useCallback, useSyncExternalStore } from 'react';

import { useAppStore } from '@/store';

const listeners = new Set<() => void>();
let frame = 0;
let width = 1920;
let resizeEnd: ReturnType<typeof setTimeout> | undefined;
const onResize = () => {
  if (document.documentElement.dataset.lobeResizing !== 'true')
    document.documentElement.dataset.lobeResizing = 'true';
  clearTimeout(resizeEnd);
  resizeEnd = setTimeout(() => delete document.documentElement.dataset.lobeResizing, 100);
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    if (width === window.innerWidth) return;
    width = window.innerWidth;
    listeners.forEach((listener) => listener());
  });
};
const subscribe = (callback: () => void) => {
  if (listeners.size === 0) {
    width = window.innerWidth;
    window.addEventListener('resize', onResize);
  }
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      window.removeEventListener('resize', onResize);
      window.cancelAnimationFrame(frame);
      clearTimeout(resizeEnd);
      delete document.documentElement.dataset.lobeResizing;
      frame = 0;
    }
  };
};
const getWidth = () => (listeners.size ? width : window.innerWidth);

/** CSS handles fluid widths; React only receives breakpoint changes. */
export const useOverlaySidebars = () => {
  const threshold = useAppStore(({ setting }) =>
    Math.max(
      900,
      720 +
        (setting.enableSidebar && setting.sidebarExpand && setting.sidebarFixedMode === 'fixed'
          ? Math.max(280, setting.sidebarWidth)
          : 0) +
        (setting.enableExtraNetworkSidebar &&
        setting.extraNetworkSidebarExpand &&
        setting.extraNetworkFixedMode === 'fixed'
          ? Math.max(280, setting.extraNetworkSidebarWidth)
          : 0),
    ),
  );
  const snapshot = useCallback(() => {
    const current = getWidth();
    return (current < 900 ? 1 : 0) | (current < threshold ? 2 : 0);
  }, [threshold]);
  const layout = useSyncExternalStore(subscribe, snapshot, () => 0);
  return { compact: Boolean(layout & 1), overlay: Boolean(layout & 2) };
};
