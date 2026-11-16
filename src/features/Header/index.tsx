import { Tooltip } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { Logo } from '@/components';
import { OFFICIAL_SITE } from '@/const/url';
import { useOverlaySidebars } from '@/hooks/useOverlaySidebars';
import { useAppStore } from '@/store';
import { type DivProps } from '@/types';

import Actions from './Actions';
import Nav from './Nav';

const Header = memo<DivProps>(({ children }) => {
  const { themeMode, version } = useAppStore(
    (st) => ({
      themeMode: st.themeMode,
      version: st.version,
    }),
    isEqual,
  );
  const theme = useTheme();
  const { compact } = useOverlaySidebars();

  return (
    <section className="lobe-header-row">
      <div className="lobe-header-brand">
        <a
          aria-label={compact ? 'Lobe Theme' : undefined}
          href={OFFICIAL_SITE}
          rel="noreferrer"
          style={{ alignItems: 'center', color: theme.colorText, display: 'flex' }}
          target="_blank"
        >
          <Tooltip title={`LobeTheme v${version}`}>
            <Logo iconOnly={compact} size={compact ? 24 : 32} />
          </Tooltip>
        </a>
      </div>
      <div className="lobe-header-nav">
        <Nav />
        {children}
      </div>
      <div className="lobe-header-actions"><Actions themeMode={themeMode} /></div>
    </section>
  );
});

export default Header;
