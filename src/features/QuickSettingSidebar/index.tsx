import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ThemeSidebar from '@/components/ThemeSidebar';

import Inner from './Inner';
import { useStyles } from './style';

const QuickSettingSidebar = memo<{ headerHeight: number }>(({ headerHeight }) => {
  const { t } = useTranslation();
  const { styles } = useStyles();
  return (
    <ThemeSidebar headerHeight={headerHeight} kind="quick" title={t('sidebar.quickSetting')}>
      <div
        className={styles.container}
        style={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}
      >
        <Inner />
      </div>
    </ThemeSidebar>
  );
});

export default QuickSettingSidebar;
