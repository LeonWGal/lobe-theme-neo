import { Segmented, Select, Switch } from 'antd';
import { useTranslation } from 'react-i18next';

import { useSettingDraft } from '@/features/Setting/Draft';
import Form from '@/features/Setting/Form/DraftForm';
import { type SettingItemGroup } from '@/features/Setting/Form/types';

export default function ToolOptions() {
  const { draft, updateDraft, apply } = useSettingDraft();
  const { t } = useTranslation();
  const flags = [
    ['enableCommandPalette', 'commandPalette'],
    ['enableLoraTools', 'loraTools'],
    ['enablePresets', 'presets'],
    ['enableHistory', 'history'],
    ['enableSystemMonitor', 'systemMonitor'],
    ['enableMemoryKeeper', 'memoryKeeper'],
  ];
  const items: SettingItemGroup[] = [
    {
      children: flags.map(([name, key]) => ({
        children: <Switch />,
        desc: t(`setting.${key}.desc` as any) as string,
        label: t(`setting.${key}.title` as any) as string,
        name,
        valuePropName: 'checked',
      })),
      title: t('setting.group.tools'),
    },
    {
      children: [
        {
          children: (
            <Segmented
              options={[
                { label: t('setting.density.comfortable'), value: 'comfortable' },
                { label: t('setting.density.compact'), value: 'compact' },
              ]}
            />
          ),
          label: t('setting.density.title'),
          name: 'density',
        },
        {
          children: (
            <Segmented
              options={[
                { label: t('setting.accordionMode.free'), value: 'free' },
                { label: t('setting.accordionMode.single'), value: 'single' },
              ]}
            />
          ),
          label: t('setting.accordionMode.title'),
          name: 'accordionMode',
        },
        {
          children: (
            <Select
              options={['harmony', 'inter', 'geist', 'system'].map((value) => ({
                label: (
                  {
                    geist: 'Geist',
                    harmony: 'HarmonyOS Sans',
                    inter: 'Inter',
                    system: 'System UI',
                  } as Record<string, string>
                )[value],
                value,
              }))}
            />
          ),
          label: t('setting.fontFamily.title'),
          name: 'fontFamily',
        },
        {
          children: (
            <Select
              options={['hack', 'geistMono', 'system'].map((value) => ({
                label: (
                  { geistMono: 'Geist Mono', hack: 'Hack', system: 'System monospace' } as Record<
                    string,
                    string
                  >
                )[value],
                value,
              }))}
            />
          ),
          label: t('setting.fontMono.title'),
          name: 'fontMono',
        },
      ],
      title: t('setting.tab.appearance'),
    },
  ];
  return (
    <Form
      initialValues={draft}
      items={items}
      onFinish={apply}
      onValuesChange={updateDraft}
      variant="borderless"
    />
  );
}
