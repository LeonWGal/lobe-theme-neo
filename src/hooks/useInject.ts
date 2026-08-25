import { consola } from 'consola';
import { RefObject, useEffect, useRef, useState } from 'react';

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
  ref: RefObject<HTMLDivElement>,
  selectors: string,
  { onSuccess, onError, debug, id, onStart, parent, inverse }: InjectOptions = {},
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [element, setElement] = useState<HTMLDivElement>();
  const isInject = useRef(false);

  useEffect(() => {
    if (isInject.current) return;

    let cancelled = false;
    let observer: MutationObserver | null = null;
    let timeoutId: any = null;

    const performInject = (ele: HTMLDivElement) => {
      if (isInject.current || cancelled) return true;
      try {
        if (id) ele.id = id;
        onStart?.(ele);
        if (inverse && ref.current) {
          ele.append(ref.current);
        } else if (ref.current) {
          ref.current.append(ele);
        } else {
          return false; // Wait until ref.current is attached
        }

        // Gradio/Svelte components (esp. multiselect Dropdowns Forge Neo uses
        // for "VAE / Text Encoder") measure layout via ResizeObserver.
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event('resize'));
          requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
        });

        setElement(ele);
        onSuccess?.(ele);
        isInject.current = true;
        setIsLoading(false);
        if (debug) consola.success(`🤯 ${debug}`);
        return true;
      } catch (error: any) {
        console.error(error);
        onError?.(error);
        setIsLoading(false);
        if (debug) consola.error(`🤯 ${debug}`, error);
        return true;
      }
    };

    const tryFindAndInject = () => {
      try {
        const root = parent
          ? ((typeof gradioApp === 'function' ? gradioApp() : document).querySelector(
              parent,
            ) as HTMLDivElement | null)
          : typeof gradioApp === 'function'
            ? gradioApp()
            : document;

        if (!root) return false;
        const ele = root.querySelector(selectors) as HTMLDivElement | null;
        if (ele) {
          return performInject(ele);
        }
      } catch {
        /* wait for DOM */
      }
      return false;
    };

    // 1. Try immediately
    if (tryFindAndInject()) {
      return;
    }

    // 2. Observe mutations until found
    const appRoot = (typeof gradioApp === 'function' ? gradioApp() : null) || document.body;
    if (appRoot) {
      observer = new MutationObserver(() => {
        if (tryFindAndInject() && observer) {
          observer.disconnect();
          observer = null;
        }
      });
      observer.observe(appRoot, { childList: true, subtree: true });
    }

    // 3. Fallback timeout so isLoading never stays true indefinitely
    timeoutId = setTimeout(() => {
      if (!isInject.current && !cancelled) {
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        setIsLoading(false);
        if (debug) consola.warn(`🤯 ${debug} timeout for selector: ${selectors}`);
      }
    }, 5000);

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [selectors, parent, id, inverse]);

  return {
    element,
    isLoaded: !isLoading,
    isLoading,
  };
};
