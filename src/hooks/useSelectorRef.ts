import { RefObject, useEffect, useRef } from 'react';

export const useSelectorRef = (selectors: string): RefObject<HTMLDivElement | null> => {
  const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
  const ref = useRef<HTMLDivElement | null>(root.querySelector(selectors));
  useEffect(() => {
    const find = () => {
      const app = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
      ref.current = app.querySelector(selectors);
    };
    find();
    const observer = new MutationObserver(find);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [selectors]);
  return ref;
};
