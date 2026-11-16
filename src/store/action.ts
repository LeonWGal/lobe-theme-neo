import { consola } from 'consola';
import i18next from 'i18next';
import type { StateCreator } from 'zustand/vanilla';

import { applyForgeDocumentFlag, detectForgeNeo } from '@/utils/forge';
import { normalizeSetting } from '@/utils/settingValidation';

import { getLatestVersion, getLocaleOptions, getSetting, getVersion, postSetting } from './api';
import { DEFAULT_SETTING, type WebuiSetting } from './initialState';
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
    return normalizeSetting(JSON.parse(raw));
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

const publishSetting = (setting: WebuiSetting) => {
  try {
    localStorage.setItem(SETTING_KEY, JSON.stringify(setting));
  } catch (error) {
    consola.warn('Unable to cache theme settings', error);
  }
  Object.assign(window, { lobeThemeSetting: setting });
  window.dispatchEvent(new CustomEvent('lobe:settings', { detail: setting }));
};

export const createSettings: StateCreator<Store, [['zustand/devtools', never]], [], StoreAction> = (
  set,
  get,
) => {
  let saveQueue: Promise<void> = Promise.resolve();
  return {
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

        const setting = normalizeSetting(themeSetting);
        await syncLanguage(setting.i18n);
        set(() => ({ setting }), false, 'onLoadSetting');
        Object.assign(window, { lobeThemeSetSetting: get().onSetSetting });
        publishSetting(setting);
        consola.success('🤯 [setting] loaded');
      } catch (error) {
        consola.warn('🤯 [setting] onLoadSetting error, applying defaults:', error);
        const fallbackSetting = readLocalSetting() || DEFAULT_SETTING;
        await syncLanguage(fallbackSetting.i18n);
        set(() => ({ setting: fallbackSetting }), false, 'onLoadSettingFallback');
        Object.assign(window, { lobeThemeSetSetting: get().onSetSetting });
        publishSetting(fallbackSetting);
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
    onSetSetting: (patch) => {
      const save = saveQueue.then(async () => {
        const previous = get().setting;
        const setting = normalizeSetting({ ...previous, ...patch }, true);
        if (!(await postSetting(setting))) throw new Error('Failed to save theme settings');
        set({ setting }, false, 'onSetSetting');
        publishSetting(setting);
        if (setting.i18n !== previous.i18n) void syncLanguage(setting.i18n);
      });
      saveQueue = save.catch(() => {});
      return save;
    },
    onSetThemeMode: (themeMode) => {
      set(() => ({ themeMode }), false, 'onSetThemeMode');
    },
    setCurrentTab: () => {
      let currentTab: string | undefined;
      if (typeof (window as any).get_uiCurrentTabContent === 'function') {
        try {
          currentTab = (window as any).get_uiCurrentTabContent()?.id;
        } catch {}
      }
      if (!currentTab) {
        const root =
          (typeof (window as any).gradioApp === 'function' ? (window as any).gradioApp() : null) ||
          document;
        const activeEl = root.querySelector(
          '#tabs > .tabitem[style*="display: block"], #tabs > .tabitem:not([style*="display: none"]), #tabs > div[id^="tab_"]',
        );
        currentTab = activeEl?.id;
      }
      consola.info('🤯 [tab] onChange', currentTab);
      if (currentTab && currentTab !== get().currentTab) {
        set({ currentTab }, false, 'setCurrentTab');
      }
    },
    setMobileSidebar: (panel) => {
      set(() => ({ mobileSidebar: panel }), false, 'setMobileSidebar');
    },
  };
};
