import { LobeHub as LobeLogo } from '@lobehub/ui/brand';
import { Space } from 'antd';
import { type CSSProperties, Suspense, lazy, memo } from 'react';

const EmojiLogo = lazy(() => import('./EmojiLogo'));

export interface CustomLogoProps {
  logoCustomTitle?: string;
  logoCustomUrl?: string;
  size?: number;
  style?: CSSProperties;
}

const CustomLogo = memo<CustomLogoProps>(({ size = 32, style, logoCustomUrl, logoCustomTitle }) => {
  let customLogo = <LobeLogo size={size} style={style} />;

  if (logoCustomUrl) {
    if (logoCustomUrl.includes('http') || logoCustomUrl.includes('data')) {
      customLogo = <img alt="logo" src={logoCustomUrl} style={{ height: size, ...style }} />;
    } else {
      customLogo = (
        <Suspense fallback={<span style={{ fontSize: size, ...style }}>{logoCustomUrl}</span>}>
          <EmojiLogo emoji={logoCustomUrl} size={size} style={style} />
        </Suspense>
      );
    }
  }

  if (!logoCustomTitle) return customLogo;

  return (
    <Space align="center" size={size * 0.3}>
      {customLogo}
      <b className="lobe-custom-logo-title" style={{ fontSize: size * 0.6, whiteSpace: 'nowrap' }}>{logoCustomTitle}</b>
    </Space>
  );
});

export default CustomLogo;
