import type { WebuiSetting } from '@/store/initialState';

export function resolveThemeAppearance(
  preference: WebuiSetting['themeAppearance'],
  systemDark: boolean,
): 'light' | 'dark' {
  if (preference === 'light' || preference === 'dark') return preference;
  return systemDark ? 'dark' : 'light';
}

/** Keep the native Gradio components and the theme on the same appearance. */
export function applyThemeAppearance(mode: 'light' | 'dark') {
  const opposite = mode === 'dark' ? 'light' : 'dark';
  for (const element of [
    document.documentElement,
    document.body,
    document.querySelector('gradio-app'),
  ]) {
    if (!element) continue;
    element.classList.remove(opposite);
    element.classList.add(mode);
  }
  document.documentElement.style.colorScheme = mode;
}
