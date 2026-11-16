/** Position syntax text over the input, accounting for labels and native scrollbars. */
export const textareaOverlayBounds = (textarea: HTMLTextAreaElement, parent: HTMLElement) => {
  const field = textarea.getBoundingClientRect();
  const origin = parent.getBoundingClientRect();
  return {
    height: field.height,
    left: field.left - origin.left + parent.scrollLeft - parent.clientLeft,
    top: field.top - origin.top + parent.scrollTop - parent.clientTop,
    width: textarea.clientWidth + textarea.clientLeft * 2,
  };
};
