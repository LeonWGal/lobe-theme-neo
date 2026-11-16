import { LobeHub } from '@lobehub/ui/brand';
import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { FORGE_NEO_URL, GITHUB_REPO_URL } from '@/const/url';
import { useInject } from '@/hooks/useInject';
import { useAppStore } from '@/store';

import { useStyles } from './style';

const Footer = memo(() => {
  const isForgeNeo = useAppStore((state) => state.isForgeNeo);
  const version = useAppStore((state) => state.version);
  const { styles } = useStyles();
  const { t } = useTranslation();
  const nativeFooter = useRef<HTMLDivElement>(null);

  useInject(nativeFooter, '#footer', { debug: '[layout] inject - Footer' });

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.identity}>
            <strong>Lobe Theme Neo</strong>
            {version && <span className={styles.version}>{version}</span>}
            {isForgeNeo && <a href={FORGE_NEO_URL} rel="noreferrer" target="_blank">Forge Neo</a>}
          </div>
          <div className={styles.links}>
            <a href={GITHUB_REPO_URL} rel="noreferrer" target="_blank">GitHub</a>
            <a href={GITHUB_REPO_URL + '/blob/main/CHANGELOG.md'} rel="noreferrer" target="_blank">
              {t('footer.changelog', { defaultValue: 'Changelog' })}
            </a>
            <a href={GITHUB_REPO_URL + '/issues'} rel="noreferrer" target="_blank">
              {t('footer.issues', { defaultValue: 'Report an issue' })}
            </a>
          </div>
        </div>
        <div className={styles.runtime} ref={nativeFooter} />
        <div className={styles.credit}>
          {t('footer.basedOn', { defaultValue: 'Based on the original theme by' })}
          <a href="https://github.com/lobehub/sd-webui-lobe-theme" rel="noreferrer" target="_blank">
            <LobeHub size={14} type="combine" />
          </a>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
