import { themeConfig } from './promptTheme';
import { escapeHtml, tokenizeLine } from './tokenize-core';

export { tokenizeLine } from './tokenize-core';

export type HighlightRun = { scope?: string; style: string; text: string };

interface ThemeColors {
  foreground: string;
  lines: Map<string, HighlightRun[]>;
  scopes: Record<string, { fontStyle?: string; foreground?: string }>;
}

const themeCache: Record<'dark' | 'light', ThemeColors | undefined> = {
  dark: undefined,
  light: undefined,
};

const getTheme = (isDarkMode: boolean): ThemeColors => {
  const key = isDarkMode ? 'dark' : 'light';
  const cached = themeCache[key];
  if (cached) return cached;
  const config = themeConfig(isDarkMode);
  const scopes: ThemeColors['scopes'] = {};
  for (const token of config.tokenColors || []) {
    for (const scope of [token.scope || []].flat()) scopes[scope] = token.settings;
  }
  const theme = {
    foreground: config.colors?.['editor.foreground'] || (isDarkMode ? '#ededed' : '#252525'),
    lines: new Map<string, HighlightRun[]>(),
    scopes,
  };
  themeCache[key] = theme;
  return theme;
};

export const promptForeground = (isDarkMode: boolean) => getTheme(isDarkMode).foreground;

export const highlightRuns = (line: string, isDarkMode: boolean): HighlightRun[] => {
    const theme = getTheme(isDarkMode);
    const cached = theme.lines.get(line);
    if (cached !== undefined) return cached;
    // merge neighbours with the same colour, as Shiki does
    const merged: HighlightRun[] = [];
    for (const [segmentText, scope] of tokenizeLine(line)) {
      const settings = scope ? theme.scopes[scope] : undefined;
      const color = settings?.foreground || theme.foreground;
      const style =
        `color:${color}` + (settings?.fontStyle === 'italic' ? ';font-style:italic' : '');
      const last = merged.at(-1);
      if (last && last.style === style && last.scope === scope) last.text += segmentText;
      else merged.push({ scope, style, text: segmentText });
    }
    if (theme.lines.size >= 256) theme.lines.delete(theme.lines.keys().next().value!);
    theme.lines.set(line, merged);
    return merged;
};

export const highlightLine = (line: string, isDarkMode: boolean): string =>
  highlightRuns(line, isDarkMode)
    .map((part) => `<span style="${part.style}">${escapeHtml(part.text)}</span>`)
    .join('');

/** The prompt as highlighted HTML, in the shape Shiki produced. */
export const codeToHtml = (text: string, isDarkMode: boolean): string => {
  const theme = getTheme(isDarkMode);
  const lines = text.split(/\r\n|\r|\n/).map(
    (line) => `<span class="line">${highlightLine(line, isDarkMode)}</span>`,
  );
  return `<pre class="shiki ${isDarkMode ? 'dark' : 'light'}" style="color:${theme.foreground}" tabindex="0"><code id="lobe_highlighter">${lines.join('\n')}</code></pre>`;
};
