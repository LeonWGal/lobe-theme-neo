import { consola } from 'consola';
import { startCase } from 'lodash-es';

const getRoot = () => (typeof gradioApp === 'function' ? gradioApp() : null) || document;

const getNavTabs = (): HTMLDivElement[] =>
  Array.prototype.slice.call(
    getRoot().querySelectorAll('#tabs > [id^="tab_"], #tabs > .tabitem') as NodeListOf<HTMLDivElement>,
  );

export const getNavButtons = (): HTMLButtonElement[] =>
  Array.prototype.slice.call(
    getRoot().querySelectorAll(
      '#tabs > .tab-nav:first-of-type button',
    ) as NodeListOf<HTMLButtonElement>,
  );

interface NavItem {
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
        id,
        index,
        label: startCase(rawText),
      };
    })
    .filter(Boolean);
};
