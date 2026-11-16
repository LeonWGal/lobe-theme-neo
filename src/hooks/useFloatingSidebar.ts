import { type RefObject, useCallback, useLayoutEffect, useRef } from 'react';

const HIDE_DELAY = 100;

/** Pointer visibility updates DOM directly, without waiting for a React render. */
export const useFloatingSidebar = (
  ref: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  controlledVisible = true,
) => {
  const visible = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const leaveRequest = useRef<() => void>(() => {});
  const cancel = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
  }, []);
  const show = useCallback(
    (next: boolean) => {
      visible.current = next;
      const content = ref.current;
      const panel = content?.closest('aside');
      if (!content || !panel) return;
      panel.classList.toggle('lobe-sidebar-hidden', !next);
      panel.dataset.lobeVisible = String(next);
      content.inert = !next;
      content.setAttribute('aria-hidden', String(!next));
      panel.querySelector('.lobe-sidebar-toggle > button')?.setAttribute('aria-expanded', String(next));
    },
    [ref],
  );
  const reveal = useCallback(() => {
    cancel();
    show(true);
  }, [cancel, show]);

  useLayoutEffect(() => {
    if (!enabled) {
      cancel();
      show(controlledVisible);
      return;
    }
    const panel = ref.current?.closest('aside');
    if (!panel) return;
    let inside = panel.matches(':hover');
    let dragging = false;
    const ownsFocus = () =>
      panel.contains(document.activeElement) &&
      document.activeElement?.matches(
        'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"], :focus-visible',
      );
    const leave = () => {
      cancel();
      if (inside || dragging || ownsFocus()) return;
      timer.current = setTimeout(() => {
        if (!inside && !dragging && !ownsFocus()) show(false);
      }, HIDE_DELAY);
    };
    leaveRequest.current = leave;
    const enter = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      inside = true;
      reveal();
    };
    const exit = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      inside = false;
      leave();
    };
    const down = () => {
      dragging = true;
      cancel();
    };
    const up = () => {
      dragging = false;
      leave();
    };
    const blur = () => {
      cancel();
      timer.current = setTimeout(leave, 0);
    };
    panel.addEventListener('pointerenter', enter);
    panel.addEventListener('pointerleave', exit);
    panel.addEventListener('pointerdown', down);
    panel.addEventListener('focusin', reveal);
    panel.addEventListener('focusout', blur);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
    reveal();
    leave();
    return () => {
      cancel();
      leaveRequest.current = () => {};
      panel.removeEventListener('pointerenter', enter);
      panel.removeEventListener('pointerleave', exit);
      panel.removeEventListener('pointerdown', down);
      panel.removeEventListener('focusin', reveal);
      panel.removeEventListener('focusout', blur);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
    };
  }, [cancel, controlledVisible, enabled, ref, reveal, show]);

  return {
    isVisible: () => !enabled || visible.current,
    reveal,
    scheduleHide: () => leaveRequest.current(),
  };
};
