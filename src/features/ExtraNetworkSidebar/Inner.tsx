import { ActionIcon, DraggablePanelBody, DraggablePanelFooter } from '@lobehub/ui';
import { Slider, message } from 'antd';
import isEqual from 'fast-deep-equal';
import { ZoomIn } from '@/icons';
import { memo, useDeferredValue, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useNetworkCardAccessibility } from '@/hooks/useNetworkCardAccessibility';
import { useNetworkPagination } from '@/hooks/useNetworkPagination';
import { selectors, useAppStore } from '@/store';

import { refreshExtraNetwork } from './refreshExtraNetwork';
import { useStyles } from './style';
import { useCivitaiHelperFix } from './useCivitaiHelperFix';
import { useInjectExtraNetwork } from './useInjectExtraNetwork';

const Inner = memo(() => {
  useNetworkPagination();
  useNetworkCardAccessibility();
  const txt2imgExtraNetworkSidebarReference = useInjectExtraNetwork('txt');
  const img2imgExtraNetworkSidebarReference = useInjectExtraNetwork('img');
  const setting = useAppStore(selectors.currentSetting, isEqual);
  const currentTab = useAppStore(selectors.currentTab);
  const [size, setSize] = useState(setting.extraNetworkCardSize);
  const deferredSize = useDeferredValue(size);
  const { styles } = useStyles({ size: deferredSize });
  const save = useAppStore((state) => state.onSetSetting);
  const needsNetworks = useAppStore(
    (state) => state.setting.extraNetworkSidebarExpand || state.mobileSidebar === 'extra',
  );
  const { t } = useTranslation();
  useEffect(() => {
    setSize(setting.extraNetworkCardSize);
  }, [setting.extraNetworkCardSize]);
  useEffect(() => {
    if (needsNetworks) {
      refreshExtraNetwork(currentTab === 'tab_img2img' ? 'img' : 'txt');
    }
  }, [currentTab, needsNetworks]);
  const saveSize = async (next: number) => {
    try {
      await save({ extraNetworkCardSize: next });
    } catch {
      setSize(useAppStore.getState().setting.extraNetworkCardSize);
      message.error(t('setting.button.saveError'));
    }
  };

  useCivitaiHelperFix();

  return (
    <>
      <DraggablePanelBody className={`${styles.body} lobe-extra-network-body`}>
        <div>
          <div
            id="txt2img-extra-network-sidebar"
            ref={txt2imgExtraNetworkSidebarReference}
            style={currentTab === 'tab_img2img' ? { display: 'none' } : { position: 'relative' }}
          />
          <div
            id="img2img-extra-network-sidebar"
            ref={img2imgExtraNetworkSidebarReference}
            style={currentTab === 'tab_img2img' ? { position: 'relative' } : { display: 'none' }}
          />
        </div>
      </DraggablePanelBody>
      <DraggablePanelFooter style={{ flexShrink: 0, gap: 8, padding: '4px 12px' }}>
        <ActionIcon
          aria-label={t('setting.extraNetworkSidebar.defaultCardSize.title')}
          icon={ZoomIn}
          onClick={() => {
            setSize(112);
            void saveSize(112);
          }}
          size={{ blockSize: 32, size: 16 }}
          title={t('setting.extraNetworkSidebar.defaultCardSize.title')}
        />
        <Slider
          ariaLabelForHandle={t('setting.extraNetworkSidebar.defaultCardSize.title')}
          max={256}
          min={64}
          onChange={setSize}
          onChangeComplete={(next) => void saveSize(next)}
          step={8}
          style={{ flex: 1 }}
          value={size}
        />
        <span style={{ color: 'var(--lobe-text-muted)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
          {size} px
        </span>
      </DraggablePanelFooter>
    </>
  );
});

export default Inner;
