export const generationTabs = ['txt2img', 'img2img'] as const;
export type WorkspaceTab = (typeof generationTabs)[number];
export const workspaceGroups = ['prompts', 'promptFields', 'parameters', 'extensions', 'commands', 'promptTools', 'output', 'outputTools'] as const;
export type WorkspaceGroup = (typeof workspaceGroups)[number];
export type PanelPlacement = 'native' | 'previewLeft' | 'stacked' | 'threeCol' | 'threeColPreviewLeft' | 'studio';
export interface GroupLayout {
  hidden: string[];
  order: string[];
}
export interface TabLayout {
  fixedPreviewWidth?: boolean;
  groups: Partial<Record<WorkspaceGroup, GroupLayout>>;
  placement: PanelPlacement;
  previewWidth: number;
  promptHeights?: Record<string, number>;
  splitPreview?: boolean;
}
export type WorkspaceLayout = Partial<Record<WorkspaceTab, TabLayout>>;
interface WorkspacePreset {
  layout: WorkspaceLayout;
  name: string;
}
export interface WorkspaceSettings {
  layout: WorkspaceLayout;
  presets: WorkspacePreset[];
}
export const defaultTabLayout: TabLayout = { groups: {}, placement: 'native', previewWidth: 50 };
export const defaultParameterOrder = ['sampling', 'seed', 'resolution'];
export const previewWidthLimits = { max: 70, min: 35 };
export const withPreviewWidth = (workspace: WorkspaceSettings, tab: WorkspaceTab, previewWidth: number): WorkspaceSettings => ({
  ...workspace,
  layout: {
    ...workspace.layout,
    [tab]: { ...(workspace.layout[tab] ?? defaultTabLayout), fixedPreviewWidth: true, previewWidth },
  },
});
export const maxPresets = 8;

const object = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
const keys = (value: unknown) =>
  Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === 'string' && /^[\w:-]{1,100}$/.test(id)))].slice(0, 64)
    : [];
const normalizeLayout = (input: unknown): WorkspaceLayout => {
  const source = object(input);
  const layout: WorkspaceLayout = {};
  for (const tab of generationTabs) {
    if (!source[tab]) continue;
    const value = object(source[tab]);
    const groups: TabLayout['groups'] = {};
    for (const name of workspaceGroups) {
      const row = object(object(value.groups)[name]);
      const order = keys(row.order);
      const hidden = keys(row.hidden);
      if (order.length || hidden.length) groups[name] = { hidden, order };
    }
    const promptHeights = Object.fromEntries(
      Object.entries(object(value.promptHeights)).filter(([id, height]) =>
        /^[\w:-]{1,100}$/.test(id) && typeof height === 'number' && Number.isInteger(height) && height >= 48 && height <= 360,
      ).slice(0, 20),
    ) as Record<string, number>;
    layout[tab] = {
      ...(value.fixedPreviewWidth === true ? { fixedPreviewWidth: true } : {}),
      ...(typeof value.splitPreview === 'boolean' ? { splitPreview: value.splitPreview } : {}),
      ...(Object.keys(promptHeights).length ? { promptHeights } : {}),
      groups,
      placement:
        value.placement === 'previewLeft' ||
        value.placement === 'stacked' ||
        value.placement === 'threeCol' ||
        value.placement === 'threeColPreviewLeft' ||
        value.placement === 'studio'
          ? value.placement
          : 'native',
      previewWidth:
        typeof value.previewWidth === 'number' && Number.isFinite(value.previewWidth)
          ? Math.max(previewWidthLimits.min, Math.min(previewWidthLimits.max, Math.round(value.previewWidth)))
          : 50,
    };
  }
  return layout;
};

export const readWorkspace = (raw: string): WorkspaceSettings => {
  try {
    const data = object(JSON.parse(raw));
    const presets: WorkspacePreset[] = [];
    if (Array.isArray(data.presets)) {
      for (const entry of data.presets.slice(0, maxPresets)) {
        const preset = object(entry);
        const name = typeof preset.name === 'string' ? preset.name.trim().slice(0, 40) : '';
        if (name && !presets.some((item) => item.name === name))
          presets.push({ layout: normalizeLayout(preset.layout), name });
      }
    }
    return { layout: normalizeLayout(data.layout), presets };
  } catch {
    return { layout: {}, presets: [] };
  }
};

export function orderItems<T extends { id: string }>(items: T[], order: string[]): T[] {
  const rank = new Map(order.map((id, index) => [id, index]));
  return [...items].sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity));
}

export type EffectiveWorkbenchLayout = 'stage' | 'docked';

export function resolveWorkbenchLayout(splitActive: boolean): EffectiveWorkbenchLayout {
  return splitActive ? 'docked' : 'stage';
}
