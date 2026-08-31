import { useEffect, useState } from 'react';

const observerOptions = {
  attributes: true,
  characterData: true,
  childList: true,
  subtree: true,
};

export const useGalleryObserver = (selector: string) => {
  const [value, setValue] = useState<string>('');
  const [allValue, setAllValue] = useState<string[]>([]);
  useEffect(() => {
    const getRoot = () => (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    let observer: MutationObserver | null = null;
    let rootObserver: MutationObserver | null = null;

    const readGallery = (container: Element) => {
      const info = container.querySelector('img[data-testid="detailed-image"]');
      const infoDoms = container.querySelectorAll('.thumbnails button img');
      const infos = Array.from(infoDoms)
        .filter(Boolean)
        .map((i: any) => i.src);
      if (info) setValue(String((info as any)?.src || ''));
      setAllValue(infos);
    };

    const attach = (container: Element) => {
      readGallery(container);
      observer = new MutationObserver(() => {
        readGallery(container);
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
  }, [selector]);

  return {
    image: value,
    images: allValue,
  };
};
