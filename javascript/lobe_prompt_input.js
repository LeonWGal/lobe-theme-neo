/* Forge delays these input events before they reach the textarea listeners. */
(() => {
  const fields = '#txt2img_prompt, #txt2img_neg_prompt, #img2img_prompt, #img2img_neg_prompt, #hires_prompt, #hires_neg_prompt';
  document.addEventListener('input', (event) => {
    const field = event.target;
    if (!event.isTrusted || !event.inputType || typeof opts === 'undefined' || !opts.prompt_debounce ||
        !(field instanceof HTMLTextAreaElement) || !field.closest(fields)) return;
    field.dispatchEvent(new CustomEvent('lobe:prompt-input', { detail: event }));
  }, true);
})();
