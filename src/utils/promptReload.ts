import { dispatchPromptInput, getPromptTextarea } from './promptInput';

const KEY = 'lobe-prompts-before-reload';
const ids = ['txt2img', 'img2img'].flatMap((tab) =>
  [false, true].map((negative) => ({ negative, tab })),
);

export const reloadWithPrompts = () => {
  const prompts = ids.flatMap(({ tab, negative }) => {
    const textarea = getPromptTextarea(tab, negative);
    return textarea ? [{ negative, tab, value: textarea.value }] : [];
  });
  // If storage is unavailable, keep the page and its prompts intact.
  sessionStorage.setItem(KEY, JSON.stringify({ prompts, time: Date.now() }));
  location.reload();
  // A cancelled beforeunload confirmation must not leave a stale restore snapshot.
  setTimeout(() => sessionStorage.removeItem(KEY), 1000);
};

export const restorePromptsAfterReload = () => {
  let pending: { negative: boolean; tab: string; value: string }[];
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    sessionStorage.removeItem(KEY);
    if (!Array.isArray(data.prompts) || Date.now() - data.time > 60_000) return;
    pending = data.prompts.filter(
      (item: any) =>
        ['txt2img', 'img2img'].includes(item?.tab) &&
        typeof item.negative === 'boolean' &&
        typeof item.value === 'string',
    );
  } catch {
    return;
  }
  let observer: MutationObserver;
  const restore = () => {
    pending = pending.filter(({ tab, negative, value }) => {
      const textarea = getPromptTextarea(tab, negative);
      if (!textarea) return true;
      textarea.value = value;
      dispatchPromptInput(textarea);
      return false;
    });
    if (!pending.length) observer.disconnect();
  };
  const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
  observer = new MutationObserver(restore);
  observer.observe(root, { childList: true, subtree: true });
  restore();
  const timeout = setTimeout(() => observer.disconnect(), 15_000);
  return () => {
    observer.disconnect();
    clearTimeout(timeout);
  };
};
