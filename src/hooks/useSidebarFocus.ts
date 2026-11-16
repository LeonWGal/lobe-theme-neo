import { type RefObject, useLayoutEffect, useRef } from 'react';

import { useAppStore } from '@/store';

/** Keep the same native controls mounted when the panel becomes a mobile dialog. */
export const useSidebarFocus = (
  ref: RefObject<HTMLDivElement | null>,
  open: boolean,
  kind: 'quick' | 'extra',
  close: () => void,
) => {
  const onClose = useRef(close);
  onClose.current = close;
  useLayoutEffect(() => {
    const content = ref.current;
    if (!open || !content) return;
    const controls = () =>
      [
        ...content.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, a[href], [tabindex="0"]',
        ),
      ].filter(
        (node) =>
          !node.hasAttribute('disabled') &&
          !node.closest('[inert], [hidden], [aria-hidden="true"]') &&
          node.getClientRects().length > 0,
      );
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    controls()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose.current();
      } else if (event.key === 'Tab') {
        const focusable = controls();
        const index = focusable.indexOf(document.activeElement as HTMLElement);
        if (!focusable.length) return;
        if (event.shiftKey && index <= 0) {
          event.preventDefault();
          focusable.at(-1)!.focus();
        } else if (!event.shiftKey && (index < 0 || index === focusable.length - 1)) {
          event.preventDefault();
          focusable[0].focus();
        }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.documentElement.style.overflow = previousOverflow;
      if (useAppStore.getState().mobileSidebar === 'none')
        document.querySelector<HTMLElement>(`[data-lobe-sidebar-trigger="${kind}"]`)?.focus();
    };
  }, [kind, open, ref]);
};
