import { ActionIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DiscordIcon, Github, Medium, TwitterX } from '@/icons';

import { DISCORD_URL, GITHUB_REPO_URL, MEDIDUM_URL, X } from '@/const/url';

const useStyles = createStyles(({ css, token }) => {
  return {
    icon: css`
      svg {
        color: ${token.colorTextDescription};
      }

      &:hover {
        svg {
          color: ${token.colorText};
        }
      }
    `,
  };
});

const Follow = memo(() => {
  const { styles } = useStyles();
  return (
    <Flexbox gap={8} horizontal>
      <a href={GITHUB_REPO_URL} rel="noreferrer" target={'_blank'}>
        <ActionIcon className={styles.icon} icon={Github} title={'GitHub'} />
      </a>
      <a href={X} rel="noreferrer" target={'_blank'}>
        <ActionIcon className={styles.icon} icon={TwitterX} title={'X / Twitter'} />
      </a>
      <a href={DISCORD_URL} rel="noreferrer" target={'_blank'}>
        <ActionIcon className={styles.icon} icon={DiscordIcon} title={'Discord'} />
      </a>
      <a href={MEDIDUM_URL} rel="noreferrer" target={'_blank'}>
        <ActionIcon className={styles.icon} icon={Medium} title={'Medium'} />
      </a>
    </Flexbox>
  );
});

export default Follow;
