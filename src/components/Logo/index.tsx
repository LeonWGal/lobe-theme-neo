import { LobeHub as LobeLogo } from '@lobehub/ui/brand';
import isEqual from 'fast-deep-equal';
import { type CSSProperties, memo } from 'react';

import { GITHUB_REPO_URL } from '@/const/url';
import { selectors, useAppStore } from '@/store';

import CustomLogo from './CustomLogo';
import KitchenLogo from './KitchenLogo';

export interface LogoProps {
  iconOnly?: boolean;
  size?: number;
  style?: CSSProperties;
}

const Logo = memo<LogoProps>(({ iconOnly, size = 32, style }) => {
  const setting = useAppStore(selectors.currentSetting, isEqual);
  const themeMode = useAppStore(selectors.themeMode);

  if (setting.logoType === 'kitchen') {
    return <KitchenLogo size={size * 0.75} style={style} themeMode={themeMode} />;
  }

  if (setting.logoType === 'custom') {
    return (
      <CustomLogo
        logoCustomTitle={iconOnly ? undefined : setting.logoCustomTitle}
        logoCustomUrl={setting.logoCustomUrl}
        size={size}
        style={style}
      />
    );
  }

  if (iconOnly) return <LobeLogo size={size} style={style} />;

  return (
    <LobeLogo
      extra={
        <a
          href={GITHUB_REPO_URL}
          rel="noreferrer"
          style={{ color: 'inherit', fontWeight: 400 }}
          target="_blank"
        >
          SD
        </a>
      }
      size={size}
      style={style}
      type="combine"
    />
  );
});

export default Logo;
