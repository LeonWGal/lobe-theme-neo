import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import Setting from '@/features/Setting';
import { useAppStore } from '@/store';
import { postSetting } from '@/store/api';
import { DEFAULT_SETTING } from '@/store/initialState';

vi.mock('@lobehub/ui', () => ({
  Modal: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  confirmModal: vi.fn(),
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock('antd-style', async (original) => ({
  ...(await original<object>()),
  useResponsive: () => ({ mobile: false }),
  useTheme: () => ({}),
}));
vi.stubGlobal('matchMedia', (query: string) => ({
  media: query,
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/features/Setting/Sidebar', () => ({
  SettingsTabs: {
    Appearance: 'appearance',
    Autocomplete: 'autocomplete',
    Layout: 'layout',
    Resolution: 'resolution',
    Sidebar: 'sidebar',
    Experimental: 'experimental',
  },
  default: ({ setTab }: any) => (
    <>
      <button onClick={() => setTab('layout')}>Layout</button>
      <button onClick={() => setTab('appearance')}>Appearance</button>
      <button onClick={() => setTab('resolution')}>Resolution</button>
    </>
  ),
  MobileSidebar: () => null,
}));
vi.mock('@/features/Setting/Form/Appearance', async () => {
  const { useSettingDraft } = await import('@/features/Setting/Draft');
  return {
    default: () => {
      const { draft, updateDraft } = useSettingDraft();
      return (
        <input
          aria-label="logo"
          value={draft.logoCustomTitle}
          onChange={(event) => updateDraft({ logoCustomTitle: event.target.value })}
        />
      );
    },
  };
});
vi.mock('@/features/Setting/Form/Layout', async () => {
  const { useSettingDraft } = await import('@/features/Setting/Draft');
  return {
    default: () => {
      const { draft, updateDraft } = useSettingDraft();
      return (
        <input
          aria-label="confirm"
          type="checkbox"
          checked={draft.confirmPageUnload}
          onChange={(event) => updateDraft({ confirmPageUnload: event.target.checked })}
        />
      );
    },
  };
});
vi.mock('@/features/Setting/Form/Sidebar', () => ({ default: () => null }));
vi.mock('@/features/Setting/Form/Autocomplete', () => ({ default: () => null }));
vi.mock('@/features/Setting/Form/Experimental', () => ({ default: () => null }));
vi.mock('@/features/Tools/Options', () => ({ default: () => null }));
vi.mock('@/features/Setting/Form/Footer', async () => {
  const { useSettingDraft } = await import('@/features/Setting/Draft');
  return {
    default: () => {
      const { apply } = useSettingDraft();
      return <button onClick={() => void apply()}>Apply</button>;
    },
  };
});
vi.mock('@/store/api', async (original) => ({
  ...(await original<object>()),
  postSetting: vi.fn(),
}));
vi.mock('i18next', () => ({ default: { language: 'en_US', changeLanguage: vi.fn() } }));

beforeEach(() => {
  useAppStore.setState({ setting: { ...DEFAULT_SETTING } });
  vi.mocked(postSetting).mockReset();
});
it('retains edits across sections and applies all changes together', async () => {
  vi.mocked(postSetting).mockResolvedValue(true);
  render(<Setting open />);
  fireEvent.change(screen.getByLabelText('logo'), { target: { value: 'My Forge' } });
  fireEvent.click(screen.getByText('Layout'));
  fireEvent.click(screen.getByLabelText('confirm'));
  fireEvent.click(screen.getByText('Appearance'));
  expect(screen.getByLabelText('logo')).toHaveValue('My Forge');
  fireEvent.click(screen.getByText('Apply'));
  await waitFor(() =>
    expect(useAppStore.getState().setting).toMatchObject({
      logoCustomTitle: 'My Forge',
      confirmPageUnload: true,
    }),
  );
});
it('keeps the draft and original settings after a save failure', async () => {
  vi.mocked(postSetting).mockResolvedValue(false);
  render(<Setting open />);
  fireEvent.change(screen.getByLabelText('logo'), { target: { value: 'Unsaved' } });
  fireEvent.click(screen.getByText('Apply'));
  await waitFor(() => expect(postSetting).toHaveBeenCalled());
  expect(useAppStore.getState().setting.logoCustomTitle).toBe('');
  expect(screen.getByLabelText('logo')).toHaveValue('Unsaved');
});

it('opens resolution settings and saves model-family presets with the theme draft', async () => {
  vi.mocked(postSetting).mockResolvedValue(true);
  render(<Setting open />);
  fireEvent.click(screen.getByText('Resolution'));
  const wan = screen.getByRole('switch', { name: 'Wan' });
  expect(wan).toHaveAttribute('aria-checked', 'false');
  fireEvent.click(wan);
  expect(wan).toHaveAttribute('aria-checked', 'true');
  fireEvent.click(screen.getByText('Apply'));
  await waitFor(() => expect(useAppStore.getState().setting.resolutionPresetsWan).toBe(true));
});
