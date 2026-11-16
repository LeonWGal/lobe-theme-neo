import {
  ConfigProvider,
  type DivProps,
  ModalHost,
  ToastHost,
  setLobeTheme,
} from '@lobehub/ui';
import { ConfigProvider as AntConfigProvider } from 'antd';
import { ThemeProvider } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { motion } from 'motion/react';
import { memo, useCallback, useEffect } from 'react';

import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { useAppStore } from '@/store';
import { getNeutralTokens } from '@/styles/neutralTokens';
import { ACCENT_COLORS, CUSTOM_NEUTRALS, getPrimaryTokens } from '@/styles/themeColors';
import { applyThemeAppearance, resolveThemeAppearance } from '@/utils/themeAppearance';

const getPopupContainer = (trigger?: HTMLElement) =>
  trigger?.closest<HTMLElement>('.lobe-modal__wrapper') ?? document.body;

const GlobalLayout = memo<DivProps>(({ children }) => {
  const onSetThemeMode = useAppStore((st) => st.onSetThemeMode);
  const themeMode = useAppStore((st) => st.themeMode);
  const setting = useAppStore(
    ({ setting }) => ({
      density: setting.density,
      enableWebFont: setting.enableWebFont,
      fontFamily: setting.fontFamily,
      fontMono: setting.fontMono,
      neutralColor: setting.neutralColor,
      primaryColor: setting.primaryColor,
      themeAppearance: setting.themeAppearance,
      themeBrightness: setting.themeBrightness,
    }),
    isEqual,
  );
  const isDarkMode = useIsDarkMode();

  useEffect(() => {
    const themeMode = resolveThemeAppearance(setting.themeAppearance, isDarkMode);
    applyThemeAppearance(themeMode);
    const neutralHex = setting.neutralColor
      ? (CUSTOM_NEUTRALS as Record<string, any>)[setting.neutralColor]?.[themeMode]?.colorNeutral ?? setting.neutralColor
      : undefined;
    const primaryHex = setting.primaryColor
      ? (ACCENT_COLORS as Record<string, string>)[setting.primaryColor] ?? setting.primaryColor
      : undefined;
    setLobeTheme({
      appearance: themeMode,
      neutralColor: neutralHex as any,
      primaryColor: primaryHex as any,
    });
    onSetThemeMode(themeMode);
  }, [isDarkMode, setting.themeAppearance, setting.neutralColor, setting.primaryColor, onSetThemeMode]);

  useEffect(() => {
    document.documentElement.dataset.lobeDensity = setting.density;
    if (!setting.enableWebFont) return;
    const selected = [
      { geist: 'geist', harmony: 'harmony-sans', inter: 'inter', system: '' }[setting.fontFamily],
      { geistMono: 'geist-mono', hack: 'mono', system: '' }[setting.fontMono],
    ];
    for (const font of selected.filter(Boolean)) {
      const href = '/lobe/assets/fonts/' + font + '/css/index.css';
      if (document.querySelector('link[data-lobe-font="' + font + '"]')) continue;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset.lobeFont = font;
      document.head.append(link);
    }
  }, [setting.enableWebFont, setting.fontFamily, setting.fontMono, setting.density]);
  const genCustomToken = useCallback(() => {
    const primaryTokens = getPrimaryTokens(themeMode, setting.primaryColor);
    return {
      ...primaryTokens,
      ...getNeutralTokens(themeMode, setting.neutralColor, setting.themeBrightness),
      fontFamily: setting.enableWebFont
        ? {
            geist: 'Geist, system-ui, sans-serif',
            harmony: '"HarmonyOS Sans", system-ui, sans-serif',
            inter: 'Inter, system-ui, sans-serif',
            system: 'system-ui, sans-serif',
          }[setting.fontFamily]
        : 'system-ui, sans-serif',
      fontFamilyCode: setting.enableWebFont
        ? { geistMono: '"Geist Mono", monospace', hack: 'Hack, monospace', system: 'monospace' }[
            setting.fontMono
          ]
        : 'monospace',
      padding: setting.density === 'compact' ? 12 : 16,
    };
  }, [
    setting.primaryColor,
    setting.neutralColor,
    setting.themeBrightness,
    themeMode,
    setting.enableWebFont,
    setting.fontFamily,
    setting.fontMono,
    setting.density,
  ]);

  return (
    setting && (
      <ConfigProvider enableCustomFonts={false} motion={motion}>
        <ThemeProvider customToken={genCustomToken} theme={{ token: genCustomToken() }} themeMode={themeMode}>
          <AntConfigProvider getPopupContainer={getPopupContainer}>
            {children}
          </AntConfigProvider>
        </ThemeProvider>
        <ModalHost />
        <ToastHost />
      </ConfigProvider>
    )
  );
});

export default GlobalLayout;
