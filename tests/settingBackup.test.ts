import { describe, expect, it } from 'vitest';

import { DEFAULT_SETTING } from '@/store/initialState';
import { buildSettingExport, parseSettingImport } from '@/utils/settingBackup';

describe('settings import', () => {
  it('round-trips the current export format', () => {
    expect(parseSettingImport(buildSettingExport(DEFAULT_SETTING))).toEqual(DEFAULT_SETTING);
  });

  it.each([
    { primaryColor: 'not-a-color' },
    { sidebarWidth: -900 },
    { enableSidebar: 'false' },
    { setting: [] },
    { schemaVersion: 999, setting: DEFAULT_SETTING },
  ])('rejects invalid settings: %j', (input) => {
    expect(() => parseSettingImport(input)).toThrow();
  });
});
