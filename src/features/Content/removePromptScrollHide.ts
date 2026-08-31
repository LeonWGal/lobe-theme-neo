export const removePromptScrollHide = () => {
  const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
  const textares = root.querySelectorAll(
    `[id$="_prompt_container"] textarea`,
  ) as NodeListOf<HTMLTextAreaElement>;
  if (!textares) return;
  for (const textarea of textares) {
    textarea.classList.remove('scroll-hide');
    textarea.style.height = 'auto';
  }
};
