import { Switch } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSettingDraft } from '../Draft';
import Form from './DraftForm';
import { SettingItemGroup } from './types';

const SettingForm = memo(() => {
  const { draft: setting, updateDraft, apply } = useSettingDraft();
  const { t } = useTranslation();

  const layout: SettingItemGroup = useMemo(
    () => ({
      children: [
        {
          children: <Switch />,
          desc: t('setting.studioHideSettingsByDefault.desc'),
          label: t('setting.studioHideSettingsByDefault.title'),
          name: 'studioHideSettingsByDefault',
          valuePropName: 'checked',
        },
        {
          children: <Switch />,
          desc: t('setting.hideFooter.desc'),
          label: t('setting.hideFooter.title'),
          name: 'layoutHideFooter',
          valuePropName: 'checked',
        },
      ],

      title: t('setting.group.layout'),
    }),
    [t],
  );

  return (
    <Form
      id="theme_settings"
      initialValues={setting}
      items={[layout]}
      onFinish={apply}
      onValuesChange={(changed) => updateDraft(changed)}
      variant="borderless"
    />
  );
});

export default SettingForm;
