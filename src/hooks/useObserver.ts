import { useEffect, useState } from 'react';

const observerOptions = {
  attributes: true,
  characterData: true,
  childList: true,
  subtree: true,
};

export const useObserver = (
  selector: string,
  { subSelector, valueProp = 'innerHTML' }: { subSelector?: string; valueProp?: string } = {},
) => {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    const getRoot = () => (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    let observer: MutationObserver | null = null;
    let rootObserver: MutationObserver | null = null;

    const readValue = (container: Element) => {
      const info = subSelector ? container.querySelector(subSelector) : container;
      if (info) {
        setValue(String((info as any)?.[valueProp] || ''));
      }
    };

    const attach = (container: Element) => {
      readValue(container);
      observer = new MutationObserver(() => {
        readValue(container);
      });
      observer.observe(container, observerOptions);
    };

    const root = getRoot();
    const infoContainer = root.querySelector(selector);
    if (infoContainer) {
      attach(infoContainer);
    } else {
      rootObserver = new MutationObserver(() => {
        const found = getRoot().querySelector(selector);
        if (found) {
          if (rootObserver) {
            rootObserver.disconnect();
            rootObserver = null;
          }
          attach(found);
        }
      });
      rootObserver.observe(root, { childList: true, subtree: true });
    }

    return () => {
      if (observer) observer.disconnect();
      if (rootObserver) rootObserver.disconnect();
    };
  }, [selector, subSelector, valueProp]);

  return String(value);
};
