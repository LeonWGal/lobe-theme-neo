import { DraggablePanelBody } from '@lobehub/ui';
import { Segmented } from 'antd';
import { Suspense, lazy, memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { bus } from '@/features/Tools/bus';
import { useInject } from '@/hooks/useInject';
import { useOverlaySidebars } from '@/hooks/useOverlaySidebars';
import { usePanelVisible } from '@/hooks/usePanelVisible';
import { useAppStore } from '@/store';
import { type DivProps } from '@/types';

const PresetsPanel = lazy(() => import('@/features/Tools/PresetsPanel'));
const SystemMonitor = lazy(() => import('./SystemMonitor'));

enum Tabs {
  Presets = 'presets',
  Setting = 'setting',
}

const Inner = memo<DivProps>(() => {
  const [tab, setTab] = useState<Tabs>(Tabs.Setting);
  const setting = useAppStore((state) => state.setting);
  const visible = usePanelVisible('quick');
  const [monitorReady, setMonitorReady] = useState(false);
  useEffect(() => {
    if (visible) setMonitorReady(true);
  }, [visible]);
  const { overlay } = useOverlaySidebars();
  useEffect(
    () =>
      bus.on('open:presets', () => {
        setTab(Tabs.Presets);
        if (overlay) useAppStore.getState().setMobileSidebar('quick');
        else {
          void useAppStore
            .getState()
            .onSetSetting({ sidebarExpand: true })
            .then(() => {
              const arrow = document.querySelector<HTMLElement>(
                '.lobe-sidebar-left .lobe-sidebar-toggle > button',
              );
              if (arrow?.getAttribute('aria-expanded') !== 'true') arrow?.click();
              requestAnimationFrame(() =>
                document.querySelector<HTMLInputElement>('.lobe-sidebar-left input')?.focus(),
              );
            });
        }
      }),
    [overlay],
  );
  const sidebarReference = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const { element: quickSettings } = useInject(sidebarReference, '#quicksettings', {
    debug: '[layout] inject - QuickSettingSidebar',
  });
  useEffect(() => {
    const input = quickSettings?.querySelector<HTMLInputElement>('#setting_sd_modules input');
    if (!input || input.placeholder) return;
    const label = t('sidebar.moduleSearch');
    input.placeholder = label;
    return () => {
      if (input.placeholder === label) input.removeAttribute('placeholder');
    };
  }, [quickSettings, t]);

  return (
    <DraggablePanelBody
      className="lobe-quick-body"
      style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden auto', padding: '10px 12px 12px' }}
    >
      <Flexbox gap={12} style={{ minWidth: 0 }}>
        <Segmented
          block
          className="lobe-quick-tabs"
          onChange={(value) => setTab(value as Tabs)}
          options={[
            { label: t('sidebar.settingsTab'), value: Tabs.Setting },
            ...(setting.enablePresets
              ? [{ label: t('tools.presets.title'), value: Tabs.Presets }]
              : []),
          ]}
          value={tab}
        />
        <div ref={sidebarReference} style={tab === Tabs.Setting ? {} : { display: 'none' }} />
        {tab === Tabs.Presets && setting.enablePresets && (
          <Suspense fallback={<span role="status">{t('custom.initializing')}</span>}>
            <PresetsPanel />
          </Suspense>
        )}
        {monitorReady && setting.enableSystemMonitor && (
          <Suspense fallback={null}>
            <SystemMonitor active={visible} memory={setting.enableMemoryKeeper} />
          </Suspense>
        )}
      </Flexbox>
    </DraggablePanelBody>
  );
});

export default Inner;
