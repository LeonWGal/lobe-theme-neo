import i18next from 'i18next';

import { getPromptTextarea, setPromptValue, undoPromptValue } from '@/utils/promptInput';

/** Split only top-level commas; Forge syntax and tag order remain intact. */
export const splitPrompt = (text: string): string[] => {
  const tags: string[] = [];
  const stack: string[] = [];
  const closing: Record<string, string> = { '(': ')', '<': '>', '[': ']', '{': '}' };
  let start = 0;
  let quote = '';
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (quote) {
      if (char === quote) quote = '';
      continue;
    }
    // Apostrophes inside words are literal text, not quotation delimiters.
    if (char === '"' || (char === "'" && (i === 0 || /[\s(,]/.test(text[i - 1])))) {
      quote = char;
    } else if (closing[char]) {
      stack.push(closing[char]);
    } else if (char === stack.at(-1)) {
      stack.pop();
    } else if (char === ',' && stack.length === 0) {
      tags.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  tags.push(text.slice(start).trim());
  return tags.filter(Boolean);
};

export const Converter = {
  convert: (input: string): string => splitPrompt(input).join(', '),
  convertArray2Str: (array: string[]): string =>
    array
      .map((item) => item.trim())
      .filter(Boolean)
      .join(', '),
  convertStr: (text: string): string => text,
  convertStr2Array: splitPrompt,
  dispatchInputEvent: (target: EventTarget) => {
    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
  },
  onClickConvert: (type: string) => {
    const changes = [false, true].flatMap((negative) => {
      const textarea = getPromptTextarea(`${type}2img`, negative);
      if (!textarea) return [];
      const before = textarea.value;
      const after = Converter.convert(before);
      return before === after ? [] : [{ after, before, negative, textarea }];
    });
    if (!changes.length) return;
    document.querySelector('#lobe-prompt-preview')?.remove();
    const dialog = document.createElement('dialog');
    dialog.id = 'lobe-prompt-preview';
    dialog.className = 'lobe-prompt-preview';
    dialog.setAttribute('aria-labelledby', 'lobe-prompt-preview-title');
    const title = document.createElement('h2');
    title.id = 'lobe-prompt-preview-title';
    title.textContent = i18next.t('prompt.formatPreview');
    dialog.append(title);
    for (const change of changes) {
      const heading = document.createElement('h3');
      heading.textContent = i18next.t(change.negative ? 'prompt.negative' : 'prompt.positive');
      dialog.append(heading);
      for (const [label, value] of [
        [i18next.t('prompt.before'), change.before],
        [i18next.t('prompt.after'), change.after],
      ]) {
        const caption = document.createElement('p');
        caption.textContent = label;
        const text = document.createElement('pre');
        text.textContent = value;
        dialog.append(caption, text);
      }
    }
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    dialog.append(status);
    const actions = document.createElement('div');
    actions.className = 'lobe-dialog-actions';
    const cancel = document.createElement('button');
    cancel.className = 'secondary gradio-button';
    cancel.textContent = i18next.t('cancel');
    cancel.onclick = () => dialog.close();
    const apply = document.createElement('button');
    apply.className = 'primary gradio-button';
    apply.textContent = i18next.t('setting.button.submit');
    apply.onclick = () => {
      if (changes.some(({ textarea, before }) => textarea.value !== before)) {
        status.textContent = i18next.t('prompt.changed');
        apply.disabled = true;
        return;
      }
      changes.forEach(({ textarea, after }) => setPromptValue(textarea, after));
      dialog.close();
    };
    actions.append(cancel, apply);
    dialog.append(actions);
    dialog.addEventListener('close', () => dialog.remove(), { once: true });
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') event.stopPropagation();
    });
    document.body.append(dialog);
    dialog.showModal();
  },
  round: (value: number): number => Math.round(value * 10_000) / 10_000,
  undo: (type: string) => {
    for (const negative of [false, true]) {
      const textarea = getPromptTextarea(`${type}2img`, negative);
      if (textarea) undoPromptValue(textarea);
    }
  },
};
