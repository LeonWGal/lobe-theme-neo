import { useEffect } from 'react';

export const useSelectorHide = (selectors: string) => {
  useEffect(() => {
    const getRoot = () => (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    const hide = () => {
      const ele = getRoot().querySelector(selectors) as HTMLElement | null;
      if (ele) {
        ele.style.display = 'none';
        return true;
      }
      return false;
    };

    if (hide()) return;

    const observer = new MutationObserver(() => {
      if (hide()) {
        observer.disconnect();
      }
    });

    observer.observe(getRoot(), { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [selectors]);
};
