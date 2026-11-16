import { expect, it } from 'vitest';

import { normalizeSetting } from '@/utils/settingValidation';
import { applyThemeAppearance, resolveThemeAppearance } from '@/utils/themeAppearance';

it('restores an explicit appearance independently of system preference and keeps the palette', () => {
  const saved = normalizeSetting({
    neutralColor: 'kitchen',
    primaryColor: 'lime',
    themeAppearance: 'dark',
  });
  expect(resolveThemeAppearance(saved.themeAppearance, false)).toBe('dark');
  expect(saved).toMatchObject({ neutralColor: 'kitchen', primaryColor: 'lime' });
  expect(resolveThemeAppearance('light', true)).toBe('light');
  expect(resolveThemeAppearance('auto', true)).toBe('dark');
  expect(resolveThemeAppearance('auto', false)).toBe('light');
});

it('synchronizes native Gradio and document colors without a page reload', () => {
  const app = document.createElement('gradio-app');
  document.body.append(app);
  applyThemeAppearance('dark');
  for (const element of [app, document.body, document.documentElement])
    expect(element.classList.contains('dark')).toBe(true);
  applyThemeAppearance('light');
  for (const element of [app, document.body, document.documentElement]) {
    expect(element.classList.contains('dark')).toBe(false);
    expect(element.classList.contains('light')).toBe(true);
  }
  expect(document.documentElement.style.colorScheme).toBe('light');
  app.remove();
});
