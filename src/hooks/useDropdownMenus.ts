import { isPromptOutputMutation } from '@/utils/promptMutations';
import { useEffect } from 'react';

import { dropdownPlacement } from '@/utils/dropdownPlacement';

const selector =
  '.gradio-dropdown ul.options, .gradio-dropdown [role="listbox"]:not(input):not(select)';
const properties = ['left', 'top', 'bottom', 'width', 'max-height'];

interface MenuState {
  anchor: HTMLElement;
  previous: string | undefined;
  styles: [string, string][];
}

export const useDropdownMenus = () => {
  useEffect(() => {
    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    const menus = new Map<HTMLElement, MenuState>();
    let frame = 0;
    let resizeObserver: ResizeObserver | null = null;
    const restore = (menu: HTMLElement, state: MenuState) => {
      if (state.previous === undefined) delete menu.dataset.lobeMenu;
      else menu.dataset.lobeMenu = state.previous;
      properties.forEach((key, index) => {
        const [value, priority] = state.styles[index];
        if (value) menu.style.setProperty(`--lobe-menu-${key}`, value, priority);
        else menu.style.removeProperty(`--lobe-menu-${key}`);
      });
    };
    const position = () => {
      frame = 0;
      for (const [menu, state] of menus) {
        const { anchor } = state;
        if (!menu.isConnected || !anchor.isConnected) {
          restore(menu, state);
          menus.delete(menu);
          resizeObserver?.unobserve(anchor);
          continue;
        }
        const placement = dropdownPlacement(
          anchor.getBoundingClientRect(),
          window.innerWidth,
          window.innerHeight,
        );
        for (const key of properties) {
          const value =
            placement[key === 'max-height' ? 'maxHeight' : (key as keyof typeof placement)];
          menu.style.setProperty(`--lobe-menu-${key}`, value === undefined ? 'auto' : `${value}px`);
        }
      }
    };
    const schedule = () => {
      if (menus.size && !frame) frame = requestAnimationFrame(position);
    };
    resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    const attach = (menu: HTMLElement) => {
      if (menus.has(menu) || menu.closest('[id$="_script_container"]')) return;
      const dropdown = menu.closest('.gradio-dropdown');
      const anchor =
        dropdown?.querySelector<HTMLElement>('.wrap-inner')?.closest<HTMLElement>('.wrap') ||
        dropdown?.querySelector<HTMLElement>('input')?.closest<HTMLElement>('.wrap') ||
        (dropdown as HTMLElement | null);
      if (!anchor) return;
      menus.set(menu, {
        anchor,
        previous: menu.dataset.lobeMenu,
        styles: properties.map((key) => [
          menu.style.getPropertyValue(`--lobe-menu-${key}`),
          menu.style.getPropertyPriority(`--lobe-menu-${key}`),
        ]),
      });
      menu.dataset.lobeMenu = 'true';
      resizeObserver?.observe(anchor);
      position();
    };
    const enhance = (node: ParentNode) => {
      if (node instanceof HTMLElement && node.matches(selector)) attach(node);
      node.querySelectorAll<HTMLElement>(selector).forEach(attach);
    };
    const observer = new MutationObserver((mutations) => {
      let removed = false;
      for (const mutation of mutations) {
        if (isPromptOutputMutation(mutation)) continue;
        if (mutation.removedNodes.length) removed = true;
        for (const node of mutation.addedNodes) if (node instanceof HTMLElement) enhance(node);
      }
      if (removed) schedule();
    });
    observer.observe(root, { childList: true, subtree: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    enhance(root);
    return () => {
      observer.disconnect();
      resizeObserver?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      menus.forEach((state, menu) => restore(menu, state));
    };
  }, []);
};
