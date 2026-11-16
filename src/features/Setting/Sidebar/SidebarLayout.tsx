import { createStyles } from 'antd-style';
import { ReactNode } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import BrandWatermark from './BrandWatermark';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    padding: 12px 12px 16px;
    background: ${token.colorBgContainer};
    border-inline-end: 1px solid ${token.colorBorder};
    font-family: ${token.fontFamily};
  `,
  desc: css`
    line-height: 1.4;
    color: ${token.colorTextSecondary};
  `,
  header: css`
    padding: 0 0.75rem;
  `,
  logo: css`
    fill: ${token.colorText};
  `,
  title: css`
    margin: 0;
    color: ${token.colorText};
    font-size: var(--lobe-type-title);
    font-weight: 600;
    line-height: var(--lobe-leading-title);
  `,
}));

interface SidebarLayoutProps extends FlexboxProps {
  desc?: ReactNode;
  title?: string;
}

const SidebarLayout = ({ children, className, title, desc, ...rest }: SidebarLayoutProps) => {
  const { cx, styles } = useStyles();
  return (
    <Flexbox
      className={cx(styles.container, className)}
      flex={'none'}
      gap={20}
      width={280}
      {...rest}
    >
      <Flexbox className={styles.header} gap={4}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {desc && <div className={styles.desc}>{desc}</div>}
      </Flexbox>
      {children}
      <BrandWatermark paddingInline={12} />
    </Flexbox>
  );
};

export default SidebarLayout;
