import type { WebuiSetting } from '@/store/initialState';

/** Changing these requires DOM reinject / full UI restart */
export const LAYOUT_RELOAD_KEYS: (keyof WebuiSetting)[] = [
  'enableSidebar',
  'enableExtraNetworkSidebar',
  'layoutHideFooter',
  'enableHighlight',
  'enableImageInfo',
  'svgIcon',
];

export const needsLayoutReload = (prev: WebuiSetting, next: Partial<WebuiSetting>): boolean =>
  LAYOUT_RELOAD_KEYS.some((key) => key in next && next[key] !== prev[key]);
