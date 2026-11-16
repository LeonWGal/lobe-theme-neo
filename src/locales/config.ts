import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en_US from '@/../locales/en_US.json';
import options from '@/../locales/options.json';

const dictionaries = import.meta.glob<Record<string, string>>('../../locales/*.json', {
  import: 'default',
});

void i18next
  .use(initReactI18next)
  .use({
    read(language: string, _namespace: string, callback: (error: Error | null, data: unknown) => void) {
      const load = dictionaries[`../../locales/${language}.json`];
      if (!load) return callback(new Error(`Unsupported locale: ${language}`), false);
      void load().then((dictionary) => callback(null, dictionary), (error) => callback(error, false));
    },
    type: 'backend' as const,
  })
  .init({
    fallbackLng: 'en_US',
    initImmediate: false,
    lng: 'en_US',
    load: 'currentOnly',
    partialBundledLanguages: true,
    resources: { en_US: { translation: en_US } },
    supportedLngs: options.map(({ value }) => value),
  });

i18next.on('languageChanged', () => window.dispatchEvent(new Event('lobe:language')));

Object.assign(window, {
  lobeTranslate: (key: string, fallback: string) => i18next.t(key as never, { defaultValue: fallback }),
});
