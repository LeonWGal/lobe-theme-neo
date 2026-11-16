import { getContrast } from 'polished';
import { describe, expect, it } from 'vitest';

import { themeConfig } from '@/modules/PromptHighlight/features/promptTheme';

describe('prompt syntax readability', () => {
  it.each([
    [false, '#f4f4f4'],
    [true, '#181818'],
  ] as const)('keeps all syntax colors readable in dark=%s', (dark, background) => {
    const theme = themeConfig(dark);
    const colors = [
      theme.colors!['editor.foreground'],
      ...theme.tokenColors!.map((token) => token.settings.foreground),
    ];
    for (const color of colors) expect(getContrast(color!, background)).toBeGreaterThanOrEqual(4.5);
  });
});
