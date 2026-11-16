import { ActionIcon, Button, SortableList } from '@lobehub/ui';
import { Input, InputNumber, Segmented, Select, Switch } from 'antd';
import { createStyles } from 'antd-style';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSettingDraft } from '@/features/Setting/Draft';
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from '@/icons';
import { useAppStore } from '@/store';

import {
  type PanelPlacement,
  type TabLayout,
  type WorkspaceGroup,
  type WorkspaceSettings,
  type WorkspaceTab,
  defaultParameterOrder,
  defaultTabLayout,
  maxPresets,
  orderItems,
  readWorkspace,
  workspaceGroups,
} from './model';
import { type Catalog, collectWorkspace } from './native';

const useStyles = createStyles(({ css, token }) => ({
  body: css`
    display: grid;
    width: 100%;
    min-width: 0;
    gap: 16px;
    font-size: var(--lobe-type-ui);
    color: var(--lobe-text);
    h2 { margin: 0 0 4px; color: ${token.colorText}; font-size: var(--lobe-type-title); line-height: var(--lobe-leading-title); }
    p { margin: 0; color: ${token.colorTextSecondary}; line-height: 1.5; }
  `,
  item: css`
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    min-height: 40px;
    gap: 4px;
    padding: 4px 8px;
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};
    color: var(--lobe-text);
    > span:first-of-type { flex: 1; min-width: 0; overflow-wrap: anywhere; color: inherit; }
  `,
  panel: css`
    display: grid;
    gap: 8px;
    padding: 12px;
    border-radius: ${token.borderRadiusLG}px;
    color: var(--lobe-text);
    > :is(label, strong, span) { color: inherit; }
    background: ${token.colorFillQuaternary};
    border: 1px solid ${token.colorBorderSecondary};
  `,
  presetCard: css`
    display: grid;
    gap: 6px;
    padding: 10px;
    text-align: left;
    cursor: pointer;
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};
    color: var(--lobe-text);
    transition: border-color 0.15s ease, background-color 0.15s ease;
    &:hover { border-color: ${token.colorPrimaryBorder}; }
  `,
  presetCardActive: css`
    border-color: ${token.colorPrimary};
    background: ${token.colorPrimaryBg};
  `,
  presetDesc: css`
    font-size: 11px;
    line-height: 1.4;
    color: ${token.colorTextSecondary};
  `,
  presetGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
    gap: 8px;
  `,
  presetTitle: css`
    font-size: 13px;
    font-weight: 600;
    color: ${token.colorText};
  `,
  presetWire: css`
    display: grid;
    gap: 4px;
    height: 52px;
    padding: 5px;
    border-radius: 4px;
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorFillQuaternary};
  `,
  presetWireBlock: css`
    border-radius: 3px;
    background: ${token.colorFillSecondary};
    border: 1px solid ${token.colorBorderSecondary};
  `,
  presetWirePreview: css`
    border-radius: 3px;
    background: ${token.colorPrimaryBg};
    border: 1px solid ${token.colorPrimaryBorder};
  `,
  row: css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    > .ant-select { flex: 1 1 180px; min-width: 0; }
    > .ant-input { flex: 1 1 140px; min-width: 0; }
  `,
}));

export default function WorkspaceEditor() {
  const { draft, updateDraft } = useSettingDraft();
  const { t } = useTranslation();
  const { cx, styles } = useStyles();
  const text = (key: string, params?: Record<string, unknown>) => t(`workspace.${key}` as never, params) as string;
  const workspace = useMemo(() => readWorkspace(draft.workspaceLayout), [draft.workspaceLayout]);
  const [tab, setTab] = useState<WorkspaceTab>(() =>
    useAppStore.getState().currentTab === 'tab_img2img' ? 'img2img' : 'txt2img',
  );
  const [group, setGroup] = useState<WorkspaceGroup>('parameters');
  const [catalog, setCatalog] = useState<Catalog>();
  const [profile, setProfile] = useState<string>();
  const [name, setName] = useState('');
  const config = workspace.layout[tab] ?? defaultTabLayout;
  const options = config.groups[group] ?? { hidden: [], order: [] };
  const items = orderItems(catalog?.[group] ?? [],
    group === 'parameters' && !options.order.length ? defaultParameterOrder : options.order);
  const save = (value: WorkspaceSettings) => updateDraft({ workspaceLayout: JSON.stringify(value) });
  const update = (patch: Partial<TabLayout>) =>
    save({ ...workspace, layout: { ...workspace.layout, [tab]: { ...config, ...patch } } });
  const changeItems = (patch: Partial<typeof options>) =>
    update({ groups: { ...config.groups, [group]: { ...options, ...patch } } });
  const move = (index: number, offset: number) => {
    const ids = items.map(({ id }) => id);
    const next = index + offset;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    changeItems({ order: ids });
  };
  const applyQuickPreset = (placement: PanelPlacement, splitPreview: boolean, previewWidth?: number) => {
    const patch = (current?: TabLayout): TabLayout => ({
      ...(current ?? defaultTabLayout),
      placement,
      splitPreview,
      ...(previewWidth !== undefined ? { previewWidth } : {}),
    });
    save({
      ...workspace,
      layout: {
        ...workspace.layout,
        img2img: patch(workspace.layout.img2img),
        txt2img: patch(workspace.layout.txt2img),
      },
    });
    setProfile(undefined);
  };
  const create = () => {
    const title = name.trim();
    if (!title || workspace.presets.length >= maxPresets || workspace.presets.some((entry) => entry.name === title)) return;
    save({ ...workspace, presets: [...workspace.presets, { layout: workspace.layout, name: title }] });
    setProfile(title);
    setName('');
  };
  useEffect(() => {
    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    const node = root.querySelector<HTMLElement>(`#tab_${tab}`);
    setCatalog(node ? collectWorkspace(node, tab) : undefined);
  }, [tab, group]);

  return (
    <section aria-label={text('title')} className={styles.body}>
      <div><h2>{text('title')}</h2><p>{text('description')}</p></div>
      <div className={styles.panel}>
        <strong>{text('quickPresets')}</strong>
        <div className={styles.presetGrid}>
          <button
            className={cx(
              styles.presetCard,
              config.placement === 'native' && config.splitPreview === false && styles.presetCardActive,
            )}
            onClick={() => applyQuickPreset('native', false)}
            type="button"
          >
            <div className={styles.presetWire} style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1.1fr 1fr' }}>
              <div className={styles.presetWireBlock} style={{ gridColumn: '1 / -1' }} />
              <div className={styles.presetWireBlock} />
              <div className={styles.presetWirePreview} />
            </div>
            <span className={styles.presetTitle}>{text('presetClassic')}</span>
            <span className={styles.presetDesc}>{text('presetClassicDesc')}</span>
          </button>
          <button
            className={cx(
              styles.presetCard,
              (config.placement === 'threeCol' ||
                config.placement === 'threeColPreviewLeft' ||
                ((config.placement === 'native' || config.placement === 'previewLeft') && config.splitPreview === true)) &&
                styles.presetCardActive,
            )}
            onClick={() => applyQuickPreset('threeCol', true, 36)}
            type="button"
          >
            <div className={styles.presetWire} style={{ gridTemplateColumns: '0.85fr 1.15fr 1fr' }}>
              <div className={styles.presetWireBlock} />
              <div className={styles.presetWireBlock} />
              <div className={styles.presetWirePreview} />
            </div>
            <span className={styles.presetTitle}>{text('presetInference')}</span>
            <span className={styles.presetDesc}>{text('presetInferenceDesc')}</span>
          </button>
          <button
            className={cx(
              styles.presetCard,
              config.placement === 'studio' && styles.presetCardActive,
            )}
            onClick={() => applyQuickPreset('studio', false)}
            type="button"
          >
            <div className={styles.presetWire} style={{ gridTemplateColumns: '0.75fr 1.6fr', gridTemplateRows: '0.8fr 1.3fr' }}>
              <div className={styles.presetWireBlock} style={{ borderStyle: 'dashed', gridRow: '1 / -1', opacity: 0.65 }} />
              <div className={styles.presetWireBlock} />
              <div className={styles.presetWirePreview} />
            </div>
            <span className={styles.presetTitle}>{text('presetStudio')}</span>
            <span className={styles.presetDesc}>{text('presetStudioDesc')}</span>
          </button>
        </div>
        {(config.placement === 'threeCol' ||
          config.placement === 'threeColPreviewLeft' ||
          ((config.placement === 'native' || config.placement === 'previewLeft') && config.splitPreview === true)) && (
          <div className={styles.row}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{text('inferenceVariant')}:</span>
            <Select
              onChange={(value: string) => {
                switch (value) {
                  case 'threeCol': {
                    applyQuickPreset('threeCol', true, 36);
                    break;
                  }
                  case 'threeColPreviewLeft': {
                    applyQuickPreset('threeColPreviewLeft', true, 36);
                    break;
                  }
                  case 'previewLeft': {
                    applyQuickPreset('previewLeft', true, 50);
                    break;
                  }
                  default: {
                    applyQuickPreset('native', true, 50);
                  }
                }
              }}
              options={[
                { label: text('inf3Col'), value: 'threeCol' },
                { label: text('inf3ColRev'), value: 'threeColPreviewLeft' },
                { label: text('inf2ColLeft'), value: 'previewLeft' },
                { label: text('inf2ColRight'), value: 'native' },
              ]}
              value={
                config.placement === 'threeCol' || config.placement === 'threeColPreviewLeft'
                  ? config.placement
                  : config.placement === 'previewLeft'
                    ? 'previewLeft'
                    : 'native'
              }
            />
          </div>
        )}
      </div>
      <div className={styles.panel}>
        <strong>{text('profiles')}</strong>
        <div className={styles.row}>
          <Select
            aria-label={text('profiles')}
            onChange={(next: string) => {
              const selected = workspace.presets.find((entry) => entry.name === next);
              if (selected) save({ ...workspace, layout: selected.layout });
              setProfile(next);
            }}
            options={workspace.presets.map(({ name: title }) => ({ label: title, value: title }))}
            placeholder={text('selectProfile')}
            value={profile}
          />
          <ActionIcon aria-label={text('deleteProfile')} disabled={!profile} icon={Trash2} onClick={() => {
            save({ ...workspace, presets: workspace.presets.filter((entry) => entry.name !== profile) });
            setProfile(undefined);
          }} title={text('deleteProfile')} />
          <Button onClick={() => { save({ ...workspace, layout: {} }); setProfile(undefined); }}>{text('reset')}</Button>
        </div>
        <div className={styles.row}>
          <Input aria-label={text('profileName')} maxLength={40} onChange={(event) => setName(event.target.value)} onPressEnter={create} placeholder={text('profileName')} value={name} />
          <Button disabled={!name.trim() || workspace.presets.length >= maxPresets || workspace.presets.some((entry) => entry.name === name.trim())} onClick={create}>{text('saveProfile')}</Button>
        </div>
      </div>
      <Segmented block onChange={(value) => setTab(value as WorkspaceTab)} options={['txt2img', 'img2img']} value={tab} />
      <div className={styles.row}>
        {workspaceGroups.map((value) => (
          <Button aria-pressed={group === value} key={value} onClick={() => setGroup(value)}
            type={group === value ? 'primary' : 'default'}>{text(`groups.${value}`)}</Button>
        ))}
      </div>
      <div className={styles.row}>
        <Button disabled={!options.order.length && !options.hidden.length} onClick={() => changeItems({ hidden: [], order: [] })}>{text('resetGroup')}</Button>
      </div>
      {items.length ? (
        <SortableList gap={4} items={items} key={`${tab}-${group}`}
          onChange={(next) => changeItems({ order: next.map(({ id }) => id) })}
          renderItem={(item) => {
            const label = item.label || text(`items.${item.id}`);
            const index = items.indexOf(item);
            return (
              <SortableList.Item id={item.id} style={{ width: '100%' }}>
                <div className={styles.item}>
                  <SortableList.DragHandle aria-label={text('drag', { label })} icon={GripVertical} />
                  <span title={label}>{label}</span>
                  {(group === 'promptFields' || group === 'prompts' && item.id !== 'tipo') && (
                    <InputNumber aria-label={text('height', { label })} max={360} min={48}
                      onChange={(value) => {
                        const promptHeights = { ...config.promptHeights };
                        if (value === null) delete promptHeights[item.id];
                        else promptHeights[item.id] = value;
                        update({ promptHeights });
                      }}
                      placeholder="px" precision={0} size="small" style={{ width: 76 }}
                      value={config.promptHeights?.[item.id] ?? null} />
                  )}
                  <Switch aria-label={text('show', { label })} checked={item.locked || !options.hidden.includes(item.id)} disabled={item.locked} onChange={(visible) => changeItems({ hidden: visible ? options.hidden.filter((id) => id !== item.id) : [...options.hidden, item.id] })}
                    size="small" />
                  <ActionIcon aria-label={text('up', { label })} disabled={index === 0} icon={ArrowUp} onClick={() => move(index, -1)} size="small" />
                  <ActionIcon aria-label={text('down', { label })} disabled={index === items.length - 1} icon={ArrowDown} onClick={() => move(index, 1)} size="small" />
                </div>
              </SortableList.Item>
            );
          }}
          renderOverlay={(item) => <div className={styles.item}>{item.label || text(`items.${item.id}`)}</div>}
        />
      ) : <p>{text('empty')}</p>}
      <p>{text('scriptNote')}</p>
    </section>
  );
}
