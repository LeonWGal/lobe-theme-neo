import { RefObject, useRef } from 'react';

export const useSelectorRef = (selectors: string): RefObject<HTMLDivElement> => {
  const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
  return useRef<HTMLDivElement>(root.querySelector(selectors) as HTMLDivElement);
};
