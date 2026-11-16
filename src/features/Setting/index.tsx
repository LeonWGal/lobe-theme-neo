import { Modal, type ModalComponentProps, confirmModal, toast } from '@lobehub/ui';
import { useResponsive, useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Suspense, lazy, memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { type WebuiSetting, selectors, useAppStore } from '@/store';
import { reloadWithPrompts } from '@/utils/promptReload';
import { needsLayoutReload } from '@/utils/settingApply';
import { normalizeSetting } from '@/utils/settingValidation';

import { SettingDraftContext } from './Draft';
import FormAppearance from './Form/Appearance';
import FormAutocomplete from './Form/Autocomplete';
import FormExperimental from './Form/Experimental';
import ToolOptions from '@/features/Tools/Options';
import QueuePanel from '@/features/Tools/QueuePanel';
import Footer from './Form/Footer';
import FormLayout from './Form/Layout';
import FormPrompt from './Form/Prompt';
import FormResolution from './Form/Resolution';
import FormSidebar from './Form/Sidebar';
import Sidebar, { MobileSidebar, SettingsTabs } from './Sidebar';

const WorkspaceEditor = lazy(() => import('@/features/Workspace/Editor'));

export interface SettingProps {
  initialTab?: SettingsTabs;
  onCancel?: ModalComponentProps['onCancel'];
  open?: ModalComponentProps['open'];
}

const Setting = memo<SettingProps>(({ open, onCancel, initialTab = SettingsTabs.Appearance }) => {
  const [tab, setTab] = useState(initialTab);
  useEffect(() => setTab(initialTab), [initialTab]);
  const { mobile } = useResponsive();
  const theme = useTheme();
  const { t } = useTranslation();
  const setting = useAppStore(selectors.currentSetting, isEqual);
  const save = useAppStore((st) => st.onSetSetting);
  const [draft, setDraft] = useState(setting);
  const [saving, setSaving] = useState(false);
  const baseline = useRef(setting);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) {
      baseline.current = setting;
      setDraft(setting);
    }
    wasOpen.current = Boolean(open);
  }, [open, setting]);
  const dirty = !isEqual(draft, baseline.current);
  const apply = async (next: Partial<WebuiSetting> = {}) => {
    if (saving) return;
    setSaving(true);
    try {
      const merged = normalizeSetting({ ...draft, ...next }, true);
      const patch = Object.fromEntries(
        Object.entries(merged).filter(
          ([key, value]) => value !== baseline.current[key as keyof WebuiSetting],
        ),
      ) as Partial<WebuiSetting>;
      await save(patch);
      const saved = useAppStore.getState().setting;
      baseline.current = saved;
      setDraft(saved);
      if (needsLayoutReload(setting, patch)) reloadWithPrompts();
      else toast.success(t('setting.button.applySuccess'));
    } catch {
      toast.error(t('setting.button.saveError'));
    } finally {
      setSaving(false);
    }
  };
  const close: NonNullable<ModalComponentProps['onCancel']> = (event) => {
    if (saving) return;
    if (!dirty) {
      onCancel?.(event);
      return;
    }
    confirmModal({
      cancelText: t('cancel'),
      content: t('setting.button.discardChanges'),
      okText: t('setting.button.discard'),
      onOk: () => onCancel?.(event),
      title: t('setting.button.unsaved'),
    });
  };

  const content = (
    <>
      {tab === SettingsTabs.Appearance && <FormAppearance />}
      {tab === SettingsTabs.Autocomplete && <FormAutocomplete />}
      {tab === SettingsTabs.Queue && <QueuePanel settings />}
      {tab === SettingsTabs.Layout && (
        <>
          <FormLayout />
          <Suspense fallback={<span role="status">{t('custom.initializing')}</span>}>
            <WorkspaceEditor />
          </Suspense>
        </>
      )}
      {tab === SettingsTabs.Prompt && <FormPrompt />}
      {tab === SettingsTabs.Resolution && <FormResolution />}
      {tab === SettingsTabs.Sidebar && <FormSidebar />}
      {tab === SettingsTabs.Experimental && <><ToolOptions/><FormExperimental /></>}
    </>
  );

  return (
    <SettingDraftContext.Provider
      value={{
        apply,
        dirty,
        draft,
        saving,
        updateDraft: (patch) => setDraft((prev) => ({ ...prev, ...patch })),
      }}
    >
      <Modal
        allowFullscreen={true}
        classNames={{ body: 'lobe-settings-body', wrapper: 'lobe-settings-popup' }}
        footer={mobile ? <Footer /> : null}
        onCancel={close}
        open={open}
        style={{
          background: mobile ? theme.colorBgContainer : undefined,
          border: 'none',
          boxShadow: `0 0 0 1px ${theme.colorBorderSecondary}`,
        }}
        styles={{
          body: {
            display: 'flex',
            height: 'min(75dvh, 750px, calc(100dvh - 160px))',
            minHeight: 0,
            overflow: 'hidden',
            padding: 0,
            paddingBlock: 0,
          },
          header: { minHeight: 40, padding: '6px 16px' },
        }}
        title={t('modal.themeSetting.title')}
        width={1024}
      >
        {mobile ? (
          <Flexbox
            align="stretch"
            height={'100%'}
            style={{ overflow: 'hidden', position: 'relative' }}
            width={'100%'}
          >
            <div style={{ flexShrink: 0, minWidth: 0, padding: 16 }}>
              <MobileSidebar setTab={setTab} tab={tab} />
            </div>
            <Flexbox
              align="stretch"
              flex={1}
              style={{ boxSizing: 'border-box', minHeight: 0, minWidth: 0, overflowX: 'hidden', overflowY: 'auto', padding: '0 16px 16px', position: 'relative' }}
              width={'100%'}
            >
              {content}
            </Flexbox>
          </Flexbox>
        ) : (
          <Flexbox horizontal width={'100%'}>
            <Sidebar setTab={setTab} tab={tab} />
            <Flexbox
              flex={1}
              style={{
                background: theme.isDarkMode ? theme.colorFillQuaternary : theme.colorBgElevated,
                minHeight: 0,
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              <Flexbox
                align="stretch"
                flex={1}
                gap={32}
                style={{ boxSizing: 'border-box', minHeight: 0, overflowX: 'hidden', overflowY: 'auto', padding: '12px clamp(16px, 3vw, 32px) 20px' }}
                width="100%"
              >
                {content}
              </Flexbox>
              <Flexbox
                style={{ borderTop: `1px solid ${theme.colorBorderSecondary}`, boxSizing: 'border-box', flexShrink: 0, padding: '8px 24px 12px' }}
                width="100%"
              >
                <Footer />
              </Flexbox>
            </Flexbox>
          </Flexbox>
        )}
      </Modal>
    </SettingDraftContext.Provider>
  );
});

export default Setting;
