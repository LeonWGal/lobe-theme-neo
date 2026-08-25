import { consola } from 'consola';
import i18next from 'i18next';
import type { StateCreator } from 'zustand/vanilla';

import { applyForgeDocumentFlag, detectForgeNeo } from '@/utils/forge';

import { getLatestVersion, getLocaleOptions, getSetting, getVersion, postSetting } from './api';
import { DEFAULT_SETTING, type WebuiSetting, type WebuiSettingKeys } from './initialState';
import type { Store } from './store';

export const SETTING_KEY = 'SD-LOBE-SETTING';
export const FALLBACK_SETTING_KEY = 'SD-KITCHEN-SETTING';
export interface StoreAction {
  onInit: () => Promise<void>;
  onLoadLatestVersion: () => Promise<void>;
  onLoadLocalOptions: () => Promise<void>;
  onLoadSetting: () => Promise<void>;
  onLoadVersion: () => Promise<void>;
  onSetSetting: (setting: Partial<WebuiSetting>) => Promise<void>;
  onSetThemeMode: (themeMode: 'light' | 'dark') => void;
  setCurrentTab: () => void;
  setMobileSidebar: (panel: 'none' | 'quick' | 'extra') => void;
}

const readLocalSetting = (): WebuiSetting | undefined => {
  try {
    const raw = localStorage.getItem(SETTING_KEY) || localStorage.getItem(FALLBACK_SETTING_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as WebuiSetting;
  } catch {
    return undefined;
  }
};

const syncLanguage = async (lng: string) => {
  if (!lng || i18next.language === lng) return;
  try {
    await i18next.changeLanguage(lng);
  } catch (error) {
    consola.warn('🤯 [i18n] changeLanguage failed', error);
  }
};

export const createSettings: StateCreator<Store, [['zustand/devtools', never]], [], StoreAction> = (
  set,
  get,
) => ({
  onInit: async () => {
    set(() => ({ loading: true }), false, 'onInit');

    try {
      applyForgeDocumentFlag();
      set(() => ({ isForgeNeo: detectForgeNeo() }), false, 'detectForgeNeo');
      if (detectForgeNeo()) {
        consola.info('🤯 [compat] Forge Neo / Gradio 4 detected');
      }

      const { onLoadSetting, onLoadVersion, onLoadLatestVersion, onLoadLocalOptions } = get();

      // Version check must not block settings / UI ready
      void onLoadLatestVersion().catch((error) => {
        consola.warn('🤯 [version] latest version check failed', error);
      });

      await Promise.allSettled([onLoadLocalOptions(), onLoadVersion(), onLoadSetting()]);
    } catch (error) {
      consola.warn('🤯 [init] initialization encountered an error:', error);
    } finally {
      set(() => ({ loading: false }), false, 'onInit');
    }
  },
  onLoadLatestVersion: async () => {
    try {
      const latestVersion = await getLatestVersion();
      set(() => ({ latestVersion }), false, 'onLoadLatestVersion');
    } catch (error) {
      consola.warn('🤯 [version] getLatestVersion failed', error);
    }
  },
  onLoadLocalOptions: async () => {
    try {
      const localeOptions = await getLocaleOptions();
      set(() => ({ localeOptions }), false, 'onLoadLocalOptions');
    } catch (error) {
      consola.warn('🤯 [locale] getLocaleOptions failed', error);
    }
  },
  onLoadSetting: async () => {
    try {
      let themeSetting: WebuiSetting | undefined;
      const webuiSetting = await getSetting();
      const localSetting = readLocalSetting();

      if (webuiSetting) {
        consola.start('🤯 [setting] loaded webui setting');
        // Prefer server as source of truth after successful POST; fill gaps from local
        themeSetting = { ...localSetting, ...webuiSetting };
      } else if (localSetting) {
        consola.info('🤯 [setting] loaded local setting');
        themeSetting = localSetting;
      }

      if (!themeSetting) {
        consola.info('🤯 [setting] loaded default setting');
        themeSetting = DEFAULT_SETTING;
      }

      // Drop unknown keys left from older Lobe builds (e.g. uiTheme: studio)
      const allowed = new Set(Object.keys(DEFAULT_SETTING) as WebuiSettingKeys[]);
      const merged = { ...DEFAULT_SETTING, ...themeSetting };
      const setting = Object.fromEntries(
        Object.entries(merged).filter(([key]) => allowed.has(key as WebuiSettingKeys)),
      ) as unknown as WebuiSetting;

      localStorage.setItem(SETTING_KEY, JSON.stringify(setting));
      void postSetting(setting);
      void syncLanguage(setting.i18n);
      set(() => ({ setting }), false, 'onLoadSetting');
      consola.success('🤯 [setting] loaded');
      console.table(setting);
    } catch (error) {
      consola.warn('🤯 [setting] onLoadSetting error, applying defaults:', error);
      const fallbackSetting = readLocalSetting() || DEFAULT_SETTING;
      set(() => ({ setting: fallbackSetting }), false, 'onLoadSettingFallback');
    }
  },
  onLoadVersion: async () => {
    try {
      const version = await getVersion();
      set(() => ({ version }), false, 'onLoadVersion');
    } catch (error) {
      consola.warn('🤯 [version] onLoadVersion failed', error);
    }
  },
  onSetSetting: async (setting) => {
    const oldSetting = get().setting;
    const newSetting = { ...oldSetting, ...setting };
    localStorage.setItem(SETTING_KEY, JSON.stringify(newSetting));
    await postSetting(newSetting);
    await syncLanguage(newSetting.i18n);
    set(() => ({ setting: newSetting }), false, 'onSetSetting');
  },
  onSetThemeMode: (themeMode) => {
    set(() => ({ themeMode }), false, 'onSetThemeMode');
  },
  setCurrentTab: () => {
    const currentTab = get_uiCurrentTabContent()?.id;
    consola.info('🤯 [tab] onChange', currentTab);
    if (currentTab && currentTab !== get().currentTab) {
      set({ currentTab }, false, 'setCurrentTab');
    }
  },
  setMobileSidebar: (panel) => {
    set(() => ({ mobileSidebar: panel }), false, 'setMobileSidebar');
  },
});
