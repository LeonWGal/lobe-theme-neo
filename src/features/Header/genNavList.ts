import { consola } from 'consola';

const getRoot = () => (typeof gradioApp === 'function' ? gradioApp() : null) || document;

const getNavTabs = (): HTMLDivElement[] =>
  Array.prototype.slice.call(
    getRoot().querySelectorAll(
      '#tabs > [id^="tab_"], #tabs > .tabitem',
    ) as NodeListOf<HTMLDivElement>,
  );

export const getNavButtons = (): HTMLButtonElement[] =>
  Array.prototype.slice.call(
    getRoot().querySelectorAll(
      '#tabs > .tab-nav:first-of-type button',
    ) as NodeListOf<HTMLButtonElement>,
  );

export type NavGroup = 'generate' | 'tools' | 'extensions' | 'system';
export interface NavItem {
  group: NavGroup;
  id: string;
  index: number;
  label: string;
}

export const genNavList = (): NavItem[] => {
  const navList = getNavTabs();
  const buttons = getNavButtons();
  consola.debug('🤯 [nav] generate nav list');
  return buttons
    .map((button, index) => {
      const tabEl = navList[index];
      const id = tabEl?.id || button.id || `tab_${index}`;
      const rawText = button.textContent?.trim() || `Tab ${index + 1}`;
      return {
        group: (['tab_txt2img','tab_img2img','tab_extras'].includes(id) ? 'generate' : ['tab_settings','tab_extensions'].includes(id) ? 'system' : ['tab_pnginfo','tab_modelmerger'].includes(id) ? 'tools' : 'extensions') as NavGroup,
        id,
        index,
        label: rawText,
      };
    })
    .filter(Boolean);
};
