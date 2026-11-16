import { ActionIcon } from '@lobehub/ui';
import { Badge, Space } from 'antd';
import qs from 'query-string';
import { Suspense, lazy, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GITHUB_REPO_URL } from '@/const/url';
import { SettingsTabs } from '@/features/Setting/Sidebar';
import { bus } from '@/features/Tools/bus';
import { useQueue } from '@/features/Tools/useQueue';
import { useOverlaySidebars } from '@/hooks/useOverlaySidebars';
import { Github, History, Moon, Search, Settings, Sun } from '@/icons';
import { selectors, useAppStore } from '@/store';
import { applyThemeAppearance } from '@/utils/themeAppearance';

const Setting = lazy(() => import('@/features/Setting'));

interface ActionsProps {
  themeMode: 'dark' | 'light';
}

const Actions = memo<ActionsProps>(() => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [initialTab, setInitialTab] = useState(SettingsTabs.Appearance);
  const showSettings = (tab = SettingsTabs.Appearance) => {
    setInitialTab(tab);
    setIsSettingOpen(true);
  };
  useEffect(() => {
    const settings = bus.on('open:settings', () => showSettings());
    const workspace = bus.on('open:workspace', () => showSettings(SettingsTabs.Layout));
    const queueSettings = bus.on('open:queue-settings', () => showSettings(SettingsTabs.Queue));
    return () => { settings(); workspace(); queueSettings(); };
  }, []);
  const themeMode = useAppStore(selectors.themeMode);
  const onSetThemeMode = useAppStore((st) => st.onSetThemeMode);
  const { t } = useTranslation();
  const queue = useQueue();
  const historyTitle = t(queue ? 'tools.queue.drawer' : 'tools.history.title');
  const { compact: mobile } = useOverlaySidebars();
  const setting = useAppStore((state) => state.setting);

  // Soft toggle: full location.replace(?__theme=) reloads Gradio and used to leave
  // Lobe stuck on Loading (onUiLoaded race). Keep URL in sync without reload.
  const handleSetTheme = useCallback(() => {
    const theme = themeMode === 'light' ? 'dark' : 'light';
    applyThemeAppearance(theme);
    onSetThemeMode(theme);

    const gradioURL = qs.parseUrl(window.location.href);
    gradioURL.query.__theme = theme;
    window.history.replaceState({}, '', qs.stringifyUrl(gradioURL));
    void useAppStore
      .getState()
      .onSetSetting({ themeAppearance: theme })
      .catch(async () => {
        applyThemeAppearance(themeMode);
        onSetThemeMode(themeMode);
        const { message } = await import('antd');
        message.error(t('setting.button.saveError'));
      });
  }, [themeMode, onSetThemeMode, t]);

  return (
    <>
      <Space.Compact>
        {setting.enableCommandPalette && (
          <ActionIcon
            aria-label={t('setting.commandPalette.title')}
            icon={Search}
            onClick={() => bus.emit('open:palette')}
            title={`${t('setting.commandPalette.title')} (Ctrl+K)`}
          />
        )}
        {(setting.enableHistory || queue) && (
          <Badge color="var(--color-accent)" count={queue?.count ?? 0} size="small">
          <ActionIcon
            aria-label={historyTitle}
            icon={History}
            onClick={() => bus.emit('open:history')}
            title={historyTitle}
          />
          </Badge>
        )}
        {!mobile && (
          <a href={`${GITHUB_REPO_URL}/issues`} rel="noreferrer" target="_blank">
            <ActionIcon
              aria-label={t('header.feedback')}
              icon={Github}
              title={t('header.feedback')}
            />
          </a>
        )}
        <ActionIcon
          aria-label={t('header.switchTheme')}
          data-lobe-theme-toggle
          icon={themeMode === 'light' ? Sun : Moon}
          onClick={handleSetTheme}
          title={t('header.switchTheme')}
        />
        <ActionIcon
          aria-label={t('header.setting')}
          icon={Settings}
          onClick={() => showSettings()}
          title={t('header.setting')}
        />
      </Space.Compact>
      <Suspense fallback={null}>
        {isSettingOpen && <Setting initialTab={initialTab} onCancel={() => setIsSettingOpen(false)} open />}
      </Suspense>
    </>
  );
});

export default Actions;
