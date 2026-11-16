import { Switch } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSettingDraft } from '../Draft';
import Form from './DraftForm';
import { SettingItemGroup } from './types';

const SettingForm = memo(() => {
  const { draft: setting, updateDraft, apply } = useSettingDraft();
  const { t } = useTranslation();

  const experimental: SettingItemGroup = useMemo(
    () => ({
      children: [
        {
          children: <Switch />,
          desc: t('setting.aspectRatio.samplingDesc', { defaultValue: 'Group the sampler, schedule, steps and CFG controls.' }),
          label: t('setting.aspectRatio.sampling', { defaultValue: 'Sampling panel' }),
          name: 'enhanceSampling',
          valuePropName: 'checked',
        },
        {
          children: <Switch />,
          desc: t('setting.imageInfo.desc'),
          label: t('setting.imageInfo.title'),
          name: 'enableImageInfo',
          valuePropName: 'checked',
        },
      ],
      title: t('setting.group.experimental'),
    }),
    [t],
  );

  return (
    <Form
      id="theme_settings"
      initialValues={setting}
      items={[experimental]}
      onFinish={apply}
      onValuesChange={(changed) => updateDraft(changed)}
      style={{ flex: 1 }}
      variant={'borderless'}
    />
  );
});

export default SettingForm;
