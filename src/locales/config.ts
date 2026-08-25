import i18next from 'i18next';
import HttpBackend, { HttpBackendOptions } from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import de_DE from '@/../locales/de_DE.json';
import en_US from '@/../locales/en_US.json';
import es_ES from '@/../locales/es_ES.json';
import fr_FR from '@/../locales/fr_FR.json';
import ja_JP from '@/../locales/ja_JP.json';
import ko_KR from '@/../locales/ko_KR.json';
import pt_BR from '@/../locales/pt_BR.json';
import ru_RU from '@/../locales/ru_RU.json';
import tr_TR from '@/../locales/tr_TR.json';
import zh_CN from '@/../locales/zh_CN.json';
import zh_HK from '@/../locales/zh_HK.json';
import type { WebuiSetting } from '@/store/initialState';

/** Keep in sync with SETTING_KEY in store/action.ts — avoid circular import via @/store */
const SETTING_KEY = 'SD-LOBE-SETTING';

export const resources = {
  de_DE: { translation: de_DE },
  en_US: { translation: en_US },
  es_ES: { translation: es_ES },
  fr_FR: { translation: fr_FR },
  ja_JP: { translation: ja_JP },
  ko_KR: { translation: ko_KR },
  pt_BR: { translation: pt_BR },
  ru_RU: { translation: ru_RU },
  tr_TR: { translation: tr_TR },
  zh_CN: { translation: zh_CN },
  zh_HK: { translation: zh_HK },
};

const readLocalI18n = (): string => {
  try {
    const raw = localStorage.getItem(SETTING_KEY);
    if (!raw) return 'en_US';
    const localSetting = JSON.parse(raw) as WebuiSetting;
    return localSetting?.i18n || 'en_US';
  } catch {
    return 'en_US';
  }
};

i18next
  .use(initReactI18next)
  .use(HttpBackend)
  .init<HttpBackendOptions>({
    backend: {
      loadPath: '/lobe/locales/{{lng}}',
    },
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'en_US',
    lng: readLocalI18n(),
    resources,
  });
