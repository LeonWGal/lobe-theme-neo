import { useEffect, useState } from 'react';

export const useExternalTextareaObserver = (textareaSelector: string) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    const getRoot = () => (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    let externalTextarea: HTMLTextAreaElement | null = null;
    let observer: MutationObserver | null = null;
    let rootObserver: MutationObserver | null = null;

    const handleInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement | null;
      if (target) setValue(target.value);
    };

    const attach = (textarea: HTMLTextAreaElement) => {
      externalTextarea = textarea;
      setValue(textarea.value);
      textarea.addEventListener('input', handleInput);
      textarea.addEventListener('change', handleInput);

      observer = new MutationObserver(() => {
        setValue(textarea.value);
      });
      observer.observe(textarea, { attributes: true, characterData: true, childList: true });
    };

    const findTextarea = () => {
      const el = getRoot().querySelector(textareaSelector) as HTMLTextAreaElement | null;
      if (el) {
        attach(el);
        return true;
      }
      return false;
    };

    if (!findTextarea()) {
      rootObserver = new MutationObserver(() => {
        if (findTextarea() && rootObserver) {
          rootObserver.disconnect();
          rootObserver = null;
        }
      });
      rootObserver.observe(getRoot(), { childList: true, subtree: true });
    }

    return () => {
      if (externalTextarea) {
        externalTextarea.removeEventListener('input', handleInput);
        externalTextarea.removeEventListener('change', handleInput);
      }
      if (observer) observer.disconnect();
      if (rootObserver) rootObserver.disconnect();
    };
  }, [textareaSelector]);

  return value;
};
