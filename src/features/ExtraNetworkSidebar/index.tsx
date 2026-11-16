import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ThemeSidebar from '@/components/ThemeSidebar';

import Inner from './Inner';

const ExtraNetworkSidebar = memo<{ headerHeight: number }>(({ headerHeight }) => {
  const { t } = useTranslation();
  return (
    <ThemeSidebar headerHeight={headerHeight} kind="extra" title={t('sidebar.extraNetwork')}>
      <Inner />
    </ThemeSidebar>
  );
});

export default ExtraNetworkSidebar;
