import i18next from 'i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand/vanilla';

import { getSetting, postSetting } from '@/store/api';
import { createStore as createAppStore } from '@/store/store';

vi.mock('i18next', () => ({ default: { changeLanguage: vi.fn(), language: 'en_US' } }));

vi.mock('@/store/api', async (original) => ({
  ...(await original<object>()),
  getSetting: vi.fn(),
  postSetting: vi.fn(),
}));

describe('settings persistence', () => {
  beforeEach(() => localStorage.clear());

  it('does not apply or cache settings after a failed save', async () => {
    vi.mocked(postSetting).mockResolvedValue(false);
    const store = createStore(createAppStore as any);
    await expect(
      (store.getState() as any).onSetSetting({ enableSidebar: false }),
    ).rejects.toThrow();
    expect((store.getState() as any).setting.enableSidebar).toBe(true);
    expect(localStorage.getItem('SD-LOBE-SETTING')).toBeNull();
  });

  it('serializes rapid saves and retains both patches', async () => {
    vi.mocked(postSetting).mockResolvedValue(true);
    const store = createStore(createAppStore as any);
    const state = store.getState() as any;
    await Promise.all([
      state.onSetSetting({ enableSidebar: false }),
      state.onSetSetting({ layoutSplitPreview: true }),
    ]);
    expect((store.getState() as any).setting).toMatchObject({
      enableSidebar: false,
      layoutSplitPreview: true,
    });
  });

  it('recovers the queue after a failed save', async () => {
    vi.mocked(postSetting).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const store = createStore(createAppStore as any);
    await expect(
      (store.getState() as any).onSetSetting({ enableSidebar: false }),
    ).rejects.toThrow();
    await (store.getState() as any).onSetSetting({ layoutSplitPreview: true });
    expect((store.getState() as any).setting.layoutSplitPreview).toBe(true);
  });

  it('keeps subsequent layout saves independent of a pending translation load', async () => {
    vi.mocked(postSetting).mockResolvedValue(true);
    vi.mocked(i18next.changeLanguage).mockImplementationOnce(() => new Promise(() => {}));
    const store = createStore(createAppStore as any);
    const state = store.getState() as any;
    await state.onSetSetting({ i18n: 'ru_RU' });
    await state.onSetSetting({ layoutSplitPreview: true });
    expect((store.getState() as any).setting).toMatchObject({ i18n: 'ru_RU', layoutSplitPreview: true });
  });

  it('restores appearance and palette in a new session, with a local fallback when the server is unavailable', async () => {
    vi.mocked(postSetting).mockResolvedValue(true);
    const store = createStore(createAppStore as any);
    await (store.getState() as any).onSetSetting({
      neutralColor: 'kitchen', primaryColor: 'lime', themeAppearance: 'dark',
    });
    const saved = (store.getState() as any).setting;
    vi.mocked(getSetting).mockResolvedValue(saved);
    const reloaded = createStore(createAppStore as any);
    await (reloaded.getState() as any).onLoadSetting();
    expect((reloaded.getState() as any).setting).toMatchObject({
      neutralColor: 'kitchen', primaryColor: 'lime', themeAppearance: 'dark',
    });
    vi.mocked(getSetting).mockResolvedValue(undefined);
    const offline = createStore(createAppStore as any);
    await (offline.getState() as any).onLoadSetting();
    expect((offline.getState() as any).setting).toMatchObject({
      neutralColor: 'kitchen', primaryColor: 'lime', themeAppearance: 'dark',
    });
  });
});
