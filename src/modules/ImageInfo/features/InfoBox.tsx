import { CopyButton } from '@lobehub/ui';
import { CSSProperties, memo, useMemo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useTranslation } from 'react-i18next';

import { ChevronDown } from '@/icons';

import { useStyles } from '../style';
import Highlighter from './Highlighter';
import { formatInfo } from './formatInfo';

export interface InfoBoxProps {
  className?: string;
  defaultExpanded?: boolean;
  showConfig?: boolean;
  showCopy?: boolean;
  showNegative?: boolean;
  style?: CSSProperties;
  value: string;
}

const SUMMARY_KEYS = ['Steps', 'Sampler', 'CFG scale', 'Size', 'Model'];

const InfoBox = memo<InfoBoxProps>(
  ({ value, className, style, defaultExpanded = false, showCopy = true, showConfig = true, showNegative = true }) => {
    const { styles, cx } = useStyles();
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(defaultExpanded);
    const data = useMemo(() => formatInfo(value), [value]);

    if (!value || value === 'undefined' || !data) return null;

    const configEntries = data?.config ? Object.entries(data.config) : [];
    const summaryText = SUMMARY_KEYS
      .filter((k) => data?.config && k in data.config)
      .map((k) => `${k}: ${data.config[k]}`)
      .join(' · ');

    return (
      <Flexbox className={className} gap={4} style={style}>
        {data?.positive && (
          <Highlighter className={styles.highlight} showCopy={showCopy} title={t('imageInfo.positive')}>
            {data.positive}
          </Highlighter>
        )}
        {showNegative && data?.negative && (
          <Highlighter
            className={cx(styles.highlight, styles.negative)}
            showCopy={showCopy}
            title={t('imageInfo.negative')}
          >
            {data.negative}
          </Highlighter>
        )}
        {showConfig && configEntries.length > 0 && (
          <Flexbox gap={4}>
            <button
              aria-expanded={expanded}
              className={styles.configHeader}
              onClick={() => setExpanded((prev) => !prev)}
              type="button"
            >
              <span className={styles.configSummary}>
                {summaryText || `${configEntries.length} params`}
              </span>
              <span style={{ flexShrink: 0, opacity: 0.75 }}>
                {expanded ? `− (${configEntries.length})` : `+ (${configEntries.length})`}
              </span>
              <ChevronDown
                size={14}
                style={{
                  flexShrink: 0,
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 150ms ease',
                }}
              />
            </button>
            {expanded && (
              <Flexbox className={styles.container} style={showCopy ? {} : { paddingRight: 12 }}>
                {configEntries.map(([key, val]) => (
                  <Flexbox className={styles.configRow} gap={8} horizontal justify={'space-between'} key={key}>
                    <Flexbox align={'center'} className={styles.configTitle} horizontal>
                      {key}:
                    </Flexbox>
                    <Flexbox align={'center'} className={styles.configValue} gap={4} horizontal>
                      {val as string}
                      {showCopy && <CopyButton content={val as string} size={'small'} />}
                    </Flexbox>
                  </Flexbox>
                ))}
              </Flexbox>
            )}
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default InfoBox;
