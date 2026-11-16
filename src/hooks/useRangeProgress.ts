import { isPromptOutputMutation } from '@/utils/promptMutations';
import { useEffect } from 'react';

export const syncRangeProgress = (range: HTMLInputElement) => {
  const min = Number(range.min || 0);
  const max = Number(range.max || 100);
  const value = Number(range.value);
  const percent = max > min ? Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)) : 0;
  const next = `${percent}%`;
  if (range.style.getPropertyValue('--lobe-range-progress') !== next)
    range.style.setProperty('--lobe-range-progress', next);
};

/** One delegated listener; no React updates or layout reads while dragging. */
export const useRangeProgress = () => {
  useEffect(() => {
    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    const pending = new Set<HTMLInputElement>();
    let frame = 0;
    // Gradio sets inline fill after Svelte applies a value received from the server.
    const nativeFill = new MutationObserver((mutations) => {
      for (const { target } of mutations) syncRangeProgress(target as HTMLInputElement);
    });
    const register = (range: HTMLInputElement) => {
      syncRangeProgress(range);
      if (!range.classList.contains('sd-ar-compact-slider'))
        nativeFill.observe(range, { attributeFilter: ['style'], attributes: true });
    };
    const enhance = (node: ParentNode) => {
      if (node instanceof HTMLInputElement && node.type === 'range') register(node);
      node.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach(register);
    };
    const refresh = (range: HTMLInputElement) => {
      pending.add(range);
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        pending.forEach((range) => {
          if (root.contains(range)) syncRangeProgress(range);
        });
        pending.clear();
      });
    };
    const update = (event: Event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      if (input.type === 'range') syncRangeProgress(input);
      if (input.type === 'number') {
        const range = input.closest('.gradio-slider')?.querySelector<HTMLInputElement>('input[type="range"]');
        if (range) refresh(range);
      }
    };
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          if (mutation.target instanceof HTMLInputElement && mutation.target.type === 'range')
            syncRangeProgress(mutation.target);
        } else if (!isPromptOutputMutation(mutation)) {
          for (const node of mutation.addedNodes) if (node instanceof HTMLElement) enhance(node);
        }
      }
    });
    enhance(root);
    root.addEventListener('input', update);
    root.addEventListener('change', update);
    observer.observe(root, {
      attributeFilter: ['value', 'min', 'max', 'step'],
      attributes: true,
      childList: true,
      subtree: true,
    });
    return () => {
      cancelAnimationFrame(frame);
      pending.clear();
      observer.disconnect();
      nativeFill.disconnect();
      root.removeEventListener('input', update);
      root.removeEventListener('change', update);
    };
  }, []);
};
