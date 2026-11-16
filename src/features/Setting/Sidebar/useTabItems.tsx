import { Icon } from '@lobehub/ui';
import { Brush, FlaskConical, Layers, Layout, Maximize2, PanelRight, TextCursorInput, Wand2 } from '@/icons';
import { useTranslation } from 'react-i18next';

import { SettingsTabs } from '@/features/Setting/Sidebar/index';

export const useTabItems = () => {
  const { t } = useTranslation();

  return [
    {
      icon: <Icon icon={Brush} />,
      key: SettingsTabs.Appearance,
      label: t('setting.tab.appearance'),
    },
    { icon: <Icon icon={Layout} />, key: SettingsTabs.Layout, label: t('setting.tab.layout') },
    { icon: <Icon icon={Maximize2} />, key: SettingsTabs.Resolution, label: t('setting.tab.resolution') },
    { icon: <Icon icon={Wand2} />, key: SettingsTabs.Prompt, label: t('setting.tab.prompt', { defaultValue: 'Prompt' }) },
    { icon: <Icon icon={TextCursorInput} />, key: SettingsTabs.Autocomplete, label: t('autocomplete.title') },
    { icon: <Icon icon={Layers} />, key: SettingsTabs.Queue, label: t('tools.queue.title') },
    {
      icon: <Icon icon={PanelRight} />,
      key: SettingsTabs.Sidebar,
      label: t('setting.tab.sidebar'),
    },
    {
      icon: <Icon icon={FlaskConical} />,
      key: SettingsTabs.Experimental,
      label: t('setting.tab.experimental'),
    },
  ];
};
