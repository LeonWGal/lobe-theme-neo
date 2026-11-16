import { createContext, useContext } from 'react';

import type { WebuiSetting } from '@/store';

export interface SettingDraft {
  apply: (next?: Partial<WebuiSetting>) => Promise<void>;
  dirty: boolean;
  draft: WebuiSetting;
  saving: boolean;
  updateDraft: (patch: Partial<WebuiSetting>) => void;
}

export const SettingDraftContext = createContext<SettingDraft | null>(null);

export const useSettingDraft = () => {
  const context = useContext(SettingDraftContext);
  if (!context) throw new Error('Settings draft provider is missing');
  return context;
};
