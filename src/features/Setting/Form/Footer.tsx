import { Button, Popconfirm, Upload, message } from 'antd';
import { useResponsive } from 'antd-style';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_SETTING } from '@/store';
import { downloadSettingJson, readSettingJsonFile } from '@/utils/settingBackup';

import { useSettingDraft } from '../Draft';

const Footer = memo(() => {
  const { t } = useTranslation();
  const { mobile } = useResponsive();
  const { draft: setting, updateDraft, apply, saving, dirty } = useSettingDraft();

  const onReset = () => updateDraft(DEFAULT_SETTING);

  const onExport = useCallback(() => {
    downloadSettingJson(setting);
    message.success(t('setting.button.exportSuccess'));
  }, [setting, t]);

  const onImportFile = useCallback(
    async (file: File) => {
      try {
        const imported = await readSettingJsonFile(file);
        updateDraft(imported);
        message.success(t('setting.button.importSuccess'));
      } catch {
        message.error(t('setting.button.importError'));
      }
    },
    [updateDraft, t],
  );

  const buttonStyle = mobile ? { flex: 1 } : { margin: 0 };

  return (
    <Flexbox flex={1} gap={12} horizontal justify={'space-between'} wrap={'wrap'}>
      <span role="status" style={{ width: '100%' }}>
        {saving ? t('setting.button.saving') : dirty ? t('setting.button.unsaved') : ''}
      </span>
      <Flexbox gap={8} horizontal style={mobile ? { flex: 1, width: '100%' } : undefined} wrap="wrap">
        <Button onClick={onExport} style={buttonStyle}>
          {t('setting.button.export')}
        </Button>
        <Upload
          accept="application/json,.json"
          beforeUpload={(file) => {
            void onImportFile(file);
            return false;
          }}
          showUploadList={false}
        >
          <Button style={buttonStyle}>{t('setting.button.import')}</Button>
        </Upload>
      </Flexbox>

      <Flexbox gap={8} horizontal style={mobile ? { flex: 1, width: '100%' } : undefined} wrap="wrap">
        <Popconfirm
          cancelText={t('cancel')}
          okText={t('confirm')}
          okType={'danger'}
          onConfirm={onReset}
          title={t('setting.button.reset')}
        >
          <Button danger style={buttonStyle}>
            {t('setting.button.reset')}
          </Button>
        </Popconfirm>
        <Button loading={saving} onClick={() => void apply()} style={buttonStyle} type="primary">
          {t('setting.button.submit')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

export default Footer;
