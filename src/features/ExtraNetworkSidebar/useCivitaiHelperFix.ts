import { consola } from 'consola';
import { useEffect, useRef, useState } from 'react';

import civitaiHelperFix from '@/scripts/civitaiHelperFix';

const findRefreshButtons = (type: 'txt' | 'img') =>
  [
    ...document.querySelectorAll(
      `#${type}2img_extra_refresh, #${type}2img_extra_tabs [id$='_extra_refresh']`,
    ),
  ] as HTMLButtonElement[];

const replaceCivitaiHelper = (type: 'txt' | 'img') => {
  for (const button of findRefreshButtons(type)) {
    button.click();

    const civitaiButton = button.nextSibling as HTMLButtonElement | null;
    if (civitaiButton) {
      civitaiButton.onclick = civitaiHelperFix;
    }
  }
};

interface CivitaiHelperFixOptions {
  debug?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  timeout?: number;
}
export const useCivitaiHelperFix = ({
  onStart,
  onSuccess,
  debug,
  timeout = 500,
}: CivitaiHelperFixOptions = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const isInject = useRef(false);
  useEffect(() => {
    if (isInject.current) return;
    onStart?.();
    const canInject =
      !!document.querySelector('#tab_civitai_helper') && findRefreshButtons('txt').length > 0;

    let timoutFn: any;

    if (canInject) {
      timoutFn = setTimeout(() => {
        try {
          replaceCivitaiHelper('txt');
          replaceCivitaiHelper('img');
          civitaiHelperFix();
        } catch (error: any) {
          setIsLoading(false);
          if (debug) consola.error(`🤯 ${debug}`, error);
        }
      }, timeout);
    }

    onSuccess?.();
    isInject.current = true;

    setIsLoading(false);
    if (debug) consola.success(`🤯 ${debug}`);

    return () => {
      if (timoutFn) clearTimeout(timoutFn);
    };
  }, []);

  return {
    isLoading,
  };
};
