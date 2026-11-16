const history = new WeakMap<HTMLTextAreaElement, string[]>();

export const dispatchPromptInput = (textarea: HTMLTextAreaElement) => {
  textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
};

export const setPromptValue = (textarea: HTMLTextAreaElement, value: string) => {
  if (textarea.value === value) return;
  const previous = history.get(textarea) || [];
  history.set(textarea, [...previous.slice(-19), textarea.value]);
  textarea.value = value;
  dispatchPromptInput(textarea);
};

export const undoPromptValue = (textarea: HTMLTextAreaElement): boolean => {
  const previous = history.get(textarea);
  if (!previous?.length) return false;
  textarea.value = previous.pop()!;
  dispatchPromptInput(textarea);
  return true;
};

export const getPromptTextarea = (tab: string, negative = false): HTMLTextAreaElement | null => {
  const type = tab.replace(/^tab_/, '');
  if (!['txt2img', 'img2img'].includes(type)) return null;
  const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
  return root.querySelector(`#${type}_${negative ? 'neg_prompt' : 'prompt'} textarea`);
};
