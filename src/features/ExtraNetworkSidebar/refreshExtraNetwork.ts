const cardsNeedLoad = (root: Element): boolean => {
  const panes = root.querySelectorAll('.extra-network-pane, .tabitem');
  if (panes.length === 0) return true;

  for (const pane of panes) {
    // Skip Generation tab content if it somehow remains
    if (pane.id?.includes('_render') || pane.id?.includes('_generation')) continue;
    if (pane.closest<HTMLElement>('.tabitem')?.style.display === 'none') continue;

    const card = pane.querySelector('.card');
    const nocards = pane.querySelector('.nocards');
    const pending = pane.querySelector('.pending');
    if (pending) return true;
    if (!nocards && !card) return true;
  }

  return false;
};

const scheduled = new Map<string, ReturnType<typeof setTimeout>[]>();
const requested = new WeakSet<HTMLButtonElement>();
/**
 * After lobe moves Extra Networks into the sidebar, Forge still needs a
 * "search all" / tab activation pass so card HTML is populated.
 * Runs idle + one delayed retry; skips work when cards are already present.
 */
export const refreshExtraNetwork = (type: 'txt' | 'img') => {
  scheduled.get(type)?.forEach(clearTimeout);
  const rootSelector = `#${type}2img_extra_tabs`;

  const run = () => {
    const app =
      typeof (window as any).gradioApp === 'function' ? (window as any).gradioApp() : null;
    const root = app?.querySelector(rootSelector) || document.querySelector(rootSelector);
    if (!root) return;

    const tabNav = root.querySelector(':scope > .tab-nav');
    const buttons = Array.from(
      tabNav?.querySelectorAll(':scope > button') ?? [],
    ) as HTMLButtonElement[];

    // buttons[0] = Generation (hidden in sidebar); open first Extra Networks page
    const enButton =
      buttons.find((btn, index) => {
        if (index === 0) return false;
        return !btn.classList.contains('hidden') && btn.style.display !== 'none';
      }) ?? buttons[1];

    const hasActiveNetwork = buttons
      .slice(1)
      .some(
        (button) =>
          button.getAttribute('aria-selected') === 'true' || button.classList.contains('selected'),
      );
    if (enButton && !hasActiveNetwork) enButton.click();

    if (!cardsNeedLoad(root)) return;

    const searchAll = Array.from(root.querySelectorAll('button.search-all')) as HTMLButtonElement[];
    for (const btn of searchAll) {
      if (requested.has(btn)) continue;
      const pane = btn.closest('.extra-network-pane') || btn.closest('.tabitem');
      if (pane?.closest<HTMLElement>('.tabitem')?.style.display === 'none') continue;
      if (!pane) {
        requested.add(btn);
        btn.click();
        continue;
      }
      const hasCards = Boolean(pane.querySelector('.card'));
      if (!hasCards && !pane.querySelector('.nocards')) {
        requested.add(btn);
        btn.click();
      }
    }
  };

  // First pass soon after inject; second pass after Forge finishes HTML fill
  scheduled.set(type, [
    setTimeout(run, 200),
    setTimeout(() => {
      run();
      scheduled.delete(type);
    }, 1500),
  ]);
};
