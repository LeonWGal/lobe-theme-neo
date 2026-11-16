import { Segmented, Switch } from 'antd';
import { useTranslation } from 'react-i18next';

import Form from './DraftForm';
import type { SettingItemGroup } from './types';

export default function FormResolution() {
  const { t } = useTranslation();
  const items: SettingItemGroup[] = [
    {
      children: [
        {
          children: <Switch />,
          desc: t('setting.aspectRatio.desc'),
          label: t('setting.aspectRatio.title'),
          name: 'enableAspectRatio',
          valuePropName: 'checked',
        },
        {
          children: (
            <Segmented options={[
              { label: t('setting.aspectRatio.buttons'), value: 'buttons' },
              { label: t('setting.aspectRatio.list'), value: 'dropdown' },
            ]} />
          ),
          label: t('setting.aspectRatio.mode'),
          name: 'aspectRatioMode',
        },
      ],
      title: t('setting.tab.resolution'),
    },
    {
      children: [
        { label: 'SDXL / Flux', name: 'resolutionPresetsXL' },
        { label: 'SD 2.x', name: 'resolutionPresetsSD2' },
        { label: 'SD 1.5', name: 'resolutionPresetsSD15' },
        { label: 'Wan', name: 'resolutionPresetsWan' },
      ].map(({ name, label }) => ({
        children: <Switch />,
        label,
        name,
        valuePropName: 'checked',
      })),
      title: t('setting.aspectRatio.families'),
    },
  ];

  return <Form items={items} variant="borderless" />;
}
