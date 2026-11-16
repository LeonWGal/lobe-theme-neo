import { RefObject, useEffect, useRef } from 'react';

export const useSelectorRef = (selectors: string): RefObject<HTMLDivElement | null> => {
  const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
  const ref = useRef<HTMLDivElement | null>(root.querySelector(selectors));
  useEffect(() => {
    let observer: MutationObserver | null = null;
    const find = () => {
      const app = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
      const found = app.querySelector<HTMLDivElement>(selectors);
      ref.current = found;
      if (found && observer) {
        observer.disconnect();
        observer = null;
      }
      return found;
    };
    if (!find()) {
      observer = new MutationObserver(find);
      observer.observe(root, { childList: true, subtree: true });
    }
    return () => {
      observer?.disconnect();
    };
  }, [selectors]);
  return ref;
};
