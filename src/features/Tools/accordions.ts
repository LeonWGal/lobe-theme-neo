import { isNativeScript } from '@/features/Workspace/native';

/**
 * "One accordion open at a time": opening an accordion folds the other open
 * accordions next to it (same tab, same nesting level), so a long column of
 * extension panels stays short.
 *
 * Plain accordions are closed the normal way. A WebUI InputAccordion (the
 * ones with a checkbox in the title) is different: while it is "linked", its
 * checkbox follows its open state, so closing it would also switch the
 * extension off. Those are only folded by the theme: their content is hidden
 * with a class, Gradio's state (and the checkbox) is left alone, and a click
 * on the title unfolds them again instead of closing them.
 */

const ACCORDION = '.gradio-accordion, .input-accordion';
const FOLDED = 'lobe-folded';
const STYLE_ID = 'lobe-accordion-style';
const CSS = `
.${FOLDED} > .label-wrap ~ *, .${FOLDED} > * > .label-wrap ~ * { display: none !important; }
html #lobe-neo-theme-app .${FOLDED} .label-wrap.open { padding-bottom: 0 !important; border-bottom: none !important; }
.${FOLDED} .label-wrap .icon { transform: rotate(-90deg) !important; }
`;

const labelOf = (accordion: Element) =>
  accordion.querySelector<HTMLElement>(':scope > .label-wrap, :scope > * > .label-wrap');

const isOpen = (accordion: Element) => Boolean(labelOf(accordion)?.classList.contains('open'));

const isShown = (accordion: Element) => isOpen(accordion) && !accordion.classList.contains(FOLDED);

/** The accordion (or tab) an accordion sits in; siblings share it. */
const scopeOf = (accordion: Element) =>
  accordion.parentElement?.closest(`${ACCORDION}, [id^="tab_"]`) || document.body;

let folding = false;

const foldOthers = (accordion: Element) => {
  folding = true;
  try {
    const scope = scopeOf(accordion);
    for (const other of scope.querySelectorAll(ACCORDION)) {
      if (other === accordion || isNativeScript(other) || scopeOf(other) !== scope || !isShown(other)) continue;
      if ((other as HTMLElement).offsetParent === null) continue; // hidden (another tab, an inactive script)
      if (other.classList.contains('input-accordion')) other.classList.add(FOLDED);
      else labelOf(other)?.click();
    }
  } finally {
    folding = false;
  }
};

export const startSingleAccordion = () => {
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.append(style);
  }
  const root: Document | HTMLElement = (window as any).gradioApp?.() || document;

  const onClick = (event: Event) => {
    if (folding) return;
    const target = event.target as HTMLElement | null;
    const label = target?.closest?.('.label-wrap');
    if (!label) return;
    const accordion = label.closest(ACCORDION);
    if (!accordion || isNativeScript(accordion)) return;

    const checkbox = target?.closest?.('input[type="checkbox"]') as HTMLInputElement | null;
    if (checkbox) {
      if (checkbox.checked && accordion.classList.contains(FOLDED)) {
        accordion.classList.remove(FOLDED);
        foldOthers(accordion);
      }
      return;
    }

    if (accordion.classList.contains(FOLDED)) {
      if (event.isTrusted && isOpen(accordion)) {
        // folded by the theme: unfold instead of letting Gradio close it
        event.preventDefault();
        event.stopPropagation();
        accordion.classList.remove(FOLDED);
        foldOthers(accordion);
        return;
      }
      accordion.classList.remove(FOLDED);
    }
    // let Gradio toggle first
    window.setTimeout(() => {
      accordion.classList.remove(FOLDED);
      if (isOpen(accordion)) foldOthers(accordion);
    }, 60);
  };

  root.addEventListener('click', onClick, true);
  return () => {
    root.removeEventListener('click', onClick, true);
    for (const folded of root.querySelectorAll(`.${FOLDED}`)) folded.classList.remove(FOLDED);
  };
};
