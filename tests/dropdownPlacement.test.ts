import { describe, expect, it } from 'vitest';

import { dropdownPlacement } from '@/utils/dropdownPlacement';

describe('Gradio dropdown viewport placement', () => {
  it('matches the field width and caps long model lists', () => {
    expect(dropdownPlacement({ left: 50, top: 60, bottom: 100, width: 280 }, 1400, 900)).toEqual({
      left: 50,
      top: 104,
      bottom: undefined,
      width: 280,
      maxHeight: 320,
    });
  });
  it('opens upward near the bottom of the screen', () => {
    const result = dropdownPlacement({ left: 24, top: 740, bottom: 780, width: 300 }, 1000, 800);
    expect(result.top).toBeUndefined();
    expect(result.bottom).toBe(64);
    expect(result.maxHeight).toBe(320);
  });
  it('clamps a wide field to a narrow screen', () => {
    const result = dropdownPlacement({ left: 300, top: 50, bottom: 90, width: 600 }, 390, 844);
    expect(result.left).toBe(8);
    expect(result.width).toBe(374);
  });
});
