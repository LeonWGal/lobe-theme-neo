import { getContrast } from 'polished';
import { expect, it } from 'vitest';

import { getNeutralTokens } from '@/styles/neutralTokens';
import { NEUTRAL_THEME_IDS } from '@/styles/themeColors';
import { getReadableAccent, getReadableForeground } from '@/utils/colorContrast';

it.each(['#2f54eb', '#52c41a', '#fadb14', '#722ed1', '#1677ff', '#e6f4ff'])(
  'keeps selected text contrast above 4.5 on %s',
  (background) => {
    expect(getContrast(background, getReadableForeground(background))).toBeGreaterThanOrEqual(4.5);
  },
);

it.each(['#cbff26', '#fadb14', '#52c41a', '#1677ff', '#f5222d'])(
  'keeps accent labels readable on light and dark surfaces for %s',
  (accent) => {
    for (const background of ['#ffffff', '#f5f5f5', '#191919', '#252525'])
      expect(getContrast(getReadableAccent(accent, background), background)).toBeGreaterThanOrEqual(
        4.5,
      );
  },
);

it('preserves an accent that already has sufficient contrast', () => {
  expect(getReadableAccent('#cbff26', '#191919')).toBe('#cbff26');
});

it.each(['dark', 'light'] as const)('keeps neutral labels and placeholders readable in %s mode', (mode) => {
  for (const id of NEUTRAL_THEME_IDS) {
    const palette = id || undefined;
    for (const brightness of [-30, 0, 30]) {
      const tokens = getNeutralTokens(mode, palette, brightness);
      for (const surface of [tokens.colorBgLayout, tokens.colorBgContainer, tokens.colorBgElevated]) {
        for (const text of [tokens.colorTextSecondary, tokens.colorTextTertiary, tokens.colorTextPlaceholder]) {
          expect(getContrast(text, surface), `${palette ?? 'default'} (${brightness}) on ${surface}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  }
});
