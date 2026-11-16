import { useEffect, useState } from 'react';
import { isPromptOutputMutation } from '@/utils/promptMutations';

export const useExternalTextareaObserver = (textareaSelector: string, deferToFrame = false) => {
  const [value, setValue] = useState(() => {
    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    return root.querySelector<HTMLTextAreaElement>(textareaSelector)?.value || '';
  });

  useEffect(() => {
    const getRoot = () => (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    let externalTextarea: HTMLTextAreaElement | null = null;
    let observer: MutationObserver | null = null;
    let rootObserver: MutationObserver | null = null;
    let restoreValueProp: (() => void) | null = null;
    let frame = 0;

    const scheduleValue = () => {
      if (!deferToFrame) {
        if (externalTextarea) setValue(externalTextarea.value);
        return;
      }
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (externalTextarea?.isConnected) setValue(externalTextarea.value);
      });
    };

    const hookValueSetter = (textarea: HTMLTextAreaElement) => {
      restoreValueProp?.();
      restoreValueProp = null;
      const protoDesc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
      if (!protoDesc?.get || !protoDesc?.set) return;
      try {
        Object.defineProperty(textarea, 'value', {
          configurable: true,
          enumerable: protoDesc.enumerable ?? true,
          get() {
            return protoDesc.get!.call(this);
          },
          set(next: string) {
            protoDesc.set!.call(this, next);
            scheduleValue();
          },
        });
        restoreValueProp = () => {
          try {
            delete (textarea as { value?: string }).value;
          } catch {
            /* ignore cleanup errors */
          }
        };
      } catch {
        /* ignore if textarea property cannot be redefined */
      }
    };

    const attach = (textarea: HTMLTextAreaElement) => {
      if (externalTextarea === textarea) return;
      externalTextarea?.removeEventListener('input', scheduleValue);
      externalTextarea?.removeEventListener('lobe:prompt-input', scheduleValue);
      externalTextarea?.removeEventListener('change', scheduleValue);
      observer?.disconnect();
      externalTextarea = textarea;
      hookValueSetter(textarea);
      setValue(textarea.value);
      textarea.addEventListener('input', scheduleValue);
      textarea.addEventListener('lobe:prompt-input', scheduleValue);
      textarea.addEventListener('change', scheduleValue);
      observer = new MutationObserver(scheduleValue);
      observer.observe(textarea, {
        attributeFilter: ['value'],
        characterData: true,
        childList: true,
        subtree: true,
      });
    };

    const findTextarea = () => {
      const el = getRoot().querySelector(textareaSelector) as HTMLTextAreaElement | null;
      if (el) {
        attach(el);
        return true;
      }
      return false;
    };

    const root = getRoot();
    const fieldId = /^#[\w-]+(?=\s)/.exec(textareaSelector)?.[0];
    const container = fieldId ? root.querySelector(fieldId) : null;
    if (!findTextarea()) setValue('');
    rootObserver = new MutationObserver((mutations) => {
      if (!externalTextarea?.isConnected &&
          mutations.some((mutation) => mutation.addedNodes.length && !isPromptOutputMutation(mutation)))
        findTextarea();
    });
    rootObserver.observe(container?.parentElement ?? root, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      restoreValueProp?.();
      if (externalTextarea) {
        externalTextarea.removeEventListener('input', scheduleValue);
        externalTextarea.removeEventListener('lobe:prompt-input', scheduleValue);
        externalTextarea.removeEventListener('change', scheduleValue);
      }
      if (observer) observer.disconnect();
      if (rootObserver) rootObserver.disconnect();
    };
  }, [textareaSelector, deferToFrame]);

  return value;
};
