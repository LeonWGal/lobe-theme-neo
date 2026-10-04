import { RefObject, useRef } from 'react';

export const useSelectorRef = (selectors: string): RefObject<HTMLDivElement | null> => {
  const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
  return useRef<HTMLDivElement | null>(root.querySelector(selectors) as HTMLDivElement);
};
