import { Icon } from '@lobehub/ui';
import { Popover } from 'antd';
import { createStyles } from 'antd-style';
import {
  ChevronDown,
  FileSearch,
  Film,
  GraduationCap,
  Images,
  LayoutGrid,
  type TablerIcon,
  Maximize2,
  Merge,
  Pin,
  Puzzle,
  Rotate3d,
  Search,
  Settings2,
  Wand2,
} from '@/icons';
import { memo, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { NavGroup, NavItem } from './genNavList';

export const ICONS: Record<string, TablerIcon> = {
  tab_extensions: Puzzle,
  tab_extras: Maximize2,
  tab_img2img: Images,
  tab_modelmerger: Merge,
  tab_pnginfo: FileSearch,
  tab_settings: Settings2,
  tab_space: LayoutGrid,
  tab_svd: Film,
  tab_train: GraduationCap,
  tab_txt2img: Wand2,
  tab_z123: Rotate3d,
};
const GROUPS: NavGroup[] = ['generate', 'tools', 'extensions', 'system'];

const useStyles = createStyles(({ css, token }) => ({
  avatar: css`
    display: grid;
    flex: 0 0 24px;
    place-items: center;
    height: 24px;
    border-radius: ${token.borderRadiusSM}px;
    background: ${token.colorFillSecondary};
    font-size: 10px;
    font-weight: 600;
  `,
  control: css`
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 28px;
    min-height: 28px;
    padding: 2px 8px;
    color: var(--lobe-text-muted);
    background: transparent;
    border: 1px solid transparent;
    border-radius: ${token.borderRadius}px;
    font: inherit;
    white-space: nowrap;
    cursor: pointer;
    &:hover { background: ${token.colorFillSecondary}; color: var(--lobe-text); }
    &[aria-pressed='true'], &[aria-expanded='true'] { color: var(--lobe-accent-text); }
  `,
  footer: css`
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
    align-items: center;
    justify-content: space-between;
    padding: 5px 12px;
    border-top: 1px solid var(--lobe-border);
    color: var(--lobe-text-muted);
    font-size: var(--lobe-type-meta);
  `,
  grid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(210px, 100%), 1fr));
    gap: 4px;
  `,
  group: css`
    padding: 8px 4px 5px;
    font-size: var(--lobe-type-meta);
    font-weight: 600;
    color: var(--lobe-text-muted);
  `,
  header: css`
    padding: 12px;
    display: grid;
    gap: 8px;
    font-size: var(--lobe-type-ui);
    font-weight: 600;
  `,
  panel: css`
    width: min(500px, calc(100vw - 24px));
    max-height: calc(100dvh - 80px);
    display: flex;
    flex-direction: column;
    background: var(--lobe-surface);
    color: var(--lobe-text);
    border: 1px solid var(--lobe-border);
    border-radius: ${token.borderRadiusLG}px;
    overflow: hidden;
  `,
  scroll: css`
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
    padding: 0 12px 12px;
  `,
  search: css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px;
    color: var(--lobe-text-muted);
    background: var(--lobe-color-bg-layout);
    border: 1px solid var(--lobe-color-border);
    border-radius: ${token.borderRadius}px;
    &:focus-within {
      border-color: var(--lobe-accent-text);
      box-shadow: 0 0 0 1px var(--lobe-accent-text);
    }
    > input[type='search'] {
      flex: 1;
      min-width: 0 !important;
      width: 100% !important;
      max-width: none !important;
      height: 32px !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      background: transparent !important;
      color: var(--lobe-text);
      font: inherit;
      font-weight: 400;
      &:focus-visible { outline: none !important; }
    }
    input::placeholder { color: var(--lobe-text-muted); }
  `,
  tab: css`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    min-height: 36px;
    padding: 4px 8px;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    > span:last-child { overflow-wrap: anywhere; }
  `,
  tile: css`
    display: flex;
    align-items: center;
    min-width: 0;
    padding-right: 4px;
    border: 1px solid transparent;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillQuaternary};
    &:hover { border-color: var(--lobe-border); }
    &[data-active='true'] {
      color: var(--lobe-accent-text);
      background: color-mix(in srgb, var(--lobe-accent-text) 10%, var(--lobe-surface));
      border-color: color-mix(in srgb, var(--lobe-accent-text) 33%, var(--lobe-border));
    }
  `,
  trigger: css`
    border-color: var(--lobe-border);
    background: var(--lobe-surface);
    font-size: var(--lobe-type-meta);
  `,
}));
/** Initials for an extension tab without an icon of its own. */
export const initials = (label: string) => {
  const words = label
    .replaceAll(/[^\d\sA-Za-z]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return label.slice(0, 1).toUpperCase();
  return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0]).toUpperCase();
};

interface TabLauncherProps {
  activeKey: string;
  /** Use an icon-only trigger when the header is narrow. */
  compact?: boolean;
  hiddenCount: number;
  items: NavItem[];
  onOpen: (id: string) => void;
  onReset: () => void;
  onTogglePin: (id: string) => void;
  pins: string[];
}

const TabLauncher = memo<TabLauncherProps>(
  ({ items, pins, activeKey, hiddenCount, onOpen, onTogglePin, onReset, compact }) => {
    const { t } = useTranslation();
    const { styles, cx } = useStyles();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const trigger = useRef<HTMLButtonElement>(null);
    const input = useRef<HTMLInputElement>(null);

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      return q ? items.filter((item) => item.label.toLowerCase().includes(q)) : items;
    }, [items, query]);

    const openTab = (id: string) => {
      onOpen(id);
      setOpen(false);
      trigger.current?.focus();
    };

    const content = (
      <div
        aria-label={t('header.nav.allTabs')}
        className={cx(styles.panel, 'lobe-tab-launcher-panel')}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }}
        role="dialog"
      >
        <div className={styles.header}>
          <strong>{t('header.nav.allTabs')}</strong>
          <div className={styles.search}>
            <Icon icon={Search} size={{ size: 15 }} />
            <input
              aria-label={t('header.nav.search')}
              className="border-none"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && filtered[0]) openTab(filtered[0].id);
              }}
              placeholder={t('header.nav.search')}
              ref={input}
              type="search"
              value={query}
            />
          </div>
        </div>
        <div className={styles.scroll}>
          {filtered.length === 0 && <div className={styles.group}>{t('header.nav.empty')}</div>}
          {GROUPS.map((group) => {
            const list = filtered.filter((item) => item.group === group);
            if (list.length === 0) return null;
            return (
              <div key={group}>
                <div className={styles.group}>
                  {t(`header.nav.groups.${group}` as any) as string}
                </div>
                <div className={styles.grid}>
                  {list.map((item) => {
                    const pinned = pins.includes(item.id);
                    const icon = ICONS[item.id];
                    return (
                      <div className={styles.tile} data-active={item.id === activeKey} key={item.id}>
                        <button
                          aria-current={item.id === activeKey ? 'page' : undefined}
                          className={styles.tab}
                          onClick={() => openTab(item.id)}
                          type="button"
                        >
                          <span aria-hidden="true" className={styles.avatar}>
                            {icon ? <Icon icon={icon} size={{ size: 15 }} /> : initials(item.label)}
                          </span>
                          <span>{item.label}</span>
                        </button>
                        <button
                          aria-label={`${pinned ? t('header.nav.unpin') : t('header.nav.pin')}: ${item.label}`}
                          aria-pressed={pinned}
                          className={styles.control}
                          onClick={() => onTogglePin(item.id)}
                          title={pinned ? t('header.nav.unpin') : t('header.nav.pin')}
                          type="button"
                        >
                          <Icon icon={Pin} size={{ size: 13 }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.footer}>
          <span>{t('header.nav.hint')}</span>
          <button className={styles.control} onClick={onReset} type="button">{t('header.nav.reset')}</button>
        </div>
      </div>
    );

    return (
      <Popover
        afterOpenChange={(value) => { if (value) input.current?.focus(); }}
        arrow={false}
        content={content}
        onOpenChange={(value) => {
          setOpen(value);
          if (value) setQuery('');
        }}
        open={open}
        overlayInnerStyle={{ padding: 0 }}
        placement="bottomRight"
        trigger={'click'}
      >
        <button
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={t('header.nav.allTabs')}
          className={cx(styles.control, styles.trigger, 'lobe-motion-control')}
          id="lobe-all-tabs"
          ref={trigger}
          title={t('header.nav.allTabs')}
          type="button"
        >
          <Icon icon={LayoutGrid} size={{ size: 15 }} />
          {!compact && t('header.nav.allTabs')}
          {!compact && hiddenCount > 0 && <span>+{hiddenCount}</span>}
          {!compact && <Icon icon={ChevronDown} size={{ size: 13 }} />}
        </button>
      </Popover>
    );
  },
);

export default TabLauncher;
