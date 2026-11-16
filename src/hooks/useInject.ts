import { consola } from 'consola';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { isPromptOutputMutation } from '@/utils/promptMutations';

interface InjectOptions {
  debug?: string;
  id?: string;
  inverse?: boolean;
  onError?: (error: Error) => void;
  onStart?: (ele: HTMLDivElement) => void;
  onSuccess?: (ele: HTMLDivElement) => void;
  parent?: string;
}

export const useInject = (
  ref: RefObject<HTMLDivElement | null>,
  selectors: string,
  options: InjectOptions = {},
) => {
  const [element, setElement] = useState<HTMLDivElement>();
  const [isLoading, setIsLoading] = useState(true);
  const callbacks = useRef(options);
  callbacks.current = options;
  const { id, inverse, parent } = options;

  useEffect(() => {
    let cancelled = false;
    let injected: HTMLDivElement | null = null;
    let inserted: HTMLDivElement | null = null;
    let anchor: Comment | null = null;
    let originalId = '';
    let observer: MutationObserver | null = null;
    const getRoot = () => (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    setElement(undefined);
    setIsLoading(true);
    const inject = () => {
      if (cancelled || injected) return;
      const root = parent ? getRoot().querySelector(parent) : getRoot();
      const target = root?.querySelector<HTMLDivElement>(selectors);
      const host = ref.current;
      if (!target || !host) return;
      try {
        originalId = target.id;
        callbacks.current.onStart?.(target);
        if (inverse) {
          target.append(host);
          inserted = host;
        } else {
          anchor = document.createComment('lobe-original-position');
          target.before(anchor);
          target.dataset.lobeNativeContent = '';
          host.append(target);
        }
        if (id) target.id = id;
        injected = target;
        observer?.disconnect();
        setElement(target);
        setIsLoading(false);
        callbacks.current.onSuccess?.(target);
        requestAnimationFrame(() => {
          if (!cancelled) window.dispatchEvent(new Event('resize'));
        });
      } catch (error) {
        callbacks.current.onError?.(error as Error);
        consola.warn(`Theme injection failed: ${selectors}`, error);
        setIsLoading(false);
      }
    };
    observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => !isPromptOutputMutation(mutation))) inject();
    });
    observer.observe(getRoot(), { childList: true, subtree: true });
    inject();
    // Stop the spinner, but retain the observer for extensions that mount late.
    const timeout = setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, 5000);
    if (typeof onUiLoaded === 'function')
      onUiLoaded(() => {
        if (!cancelled) inject();
      });
    return () => {
      cancelled = true;
      observer?.disconnect();
      clearTimeout(timeout);
      if (inserted) inserted.remove();
      if (injected && inverse && id) injected.id = originalId;
      if (injected && !inverse && anchor?.parentNode) {
        anchor.parentNode.insertBefore(injected, anchor);
        if (id) injected.id = originalId;
      }
      if (injected && !inverse) delete injected.dataset.lobeNativeContent;
      anchor?.remove();
    };
  }, [selectors, parent, id, inverse, ref]);

  return { element, isLoaded: Boolean(element), isLoading };
};
