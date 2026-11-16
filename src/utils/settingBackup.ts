import schema from '@/../setting_schema.json';
import type { WebuiSetting } from '@/store/initialState';
import { DEFAULT_SETTING } from '@/store/initialState';

import { isSettingObject, normalizeSetting } from './settingValidation';

export const SETTING_SCHEMA_VERSION = 1;

export interface LobeSettingExport {
  exportedAt?: string;
  schemaVersion: number;
  setting: WebuiSetting;
}

export const buildSettingExport = (setting: WebuiSetting): LobeSettingExport => ({
  exportedAt: new Date().toISOString(),
  schemaVersion: SETTING_SCHEMA_VERSION,
  setting: { ...DEFAULT_SETTING, ...setting },
});

export const parseSettingImport = (raw: unknown): WebuiSetting => {
  if (!isSettingObject(raw)) {
    throw new Error('Invalid settings file');
  }

  const data = raw as Record<string, unknown>;

  // New format: { schemaVersion, setting }
  if ('schemaVersion' in data && data.schemaVersion !== SETTING_SCHEMA_VERSION) {
    throw new Error('Unsupported settings version');
  }
  if ('setting' in data) {
    return normalizeSetting(data.setting, true);
  }

  // Legacy: flat WebuiSetting object
  if (Object.keys(schema).some((key) => key in data)) {
    return normalizeSetting(data, true);
  }

  throw new Error('Unrecognized settings format');
};

export const downloadSettingJson = (setting: WebuiSetting) => {
  const payload = buildSettingExport(setting);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lobe-theme-settings-v${SETTING_SCHEMA_VERSION}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const readSettingJsonFile = async (file: File): Promise<WebuiSetting> => {
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    return parseSettingImport(json);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse settings');
    }

    throw error instanceof Error ? error : new Error('Failed to read file');
  }
};
