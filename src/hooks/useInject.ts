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

    try {
      const root = parent ? (gradioApp().querySelector(parent) as HTMLDivElement) : gradioApp();
      const ele = root.querySelector(selectors) as HTMLDivElement;
      if (ele) {
        if (id) ele.id = id;
        onStart?.(ele);
        if (inverse && ref.current) {
          ele.append(ref.current);
        } else {
          ref.current?.append(ele);
        }

        // Gradio/Svelte components (esp. multiselect Dropdowns Forge Neo uses
        // for "VAE / Text Encoder") measure layout via ResizeObserver.
        // Nudge browser on next frames so components re-measure against their new parent.
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event('resize'));
          requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
        });

        setElement(ele);
        onSuccess?.(ele);
        isInject.current = true;
        setIsLoading(false);
        if (debug) consola.success(`🤯 ${debug}`);
      } else {
        if (debug) consola.error(`🤯 ${debug}`, `Element not found for selector: ${selectors}`);
      }
    } catch (error: any) {
      console.error(error);
      onError?.(error);
      setIsLoading(false);
      if (debug) consola.error(`🤯 ${debug}`, error);
    }
  }, []);
  return {
    element,
    isLoaded: !isLoading,
    isLoading,
  };
};
