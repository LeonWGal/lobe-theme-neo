import { describe, expect, it, vi } from 'vitest';

import { textareaOverlayBounds } from '@/utils/textareaOverlay';

describe('native prompt overlay alignment', () => {
  it('accounts for a visible label above the textarea', () => {
    const parent = document.createElement('div');
    const field = document.createElement('textarea');
    vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({ left: 20, top: 100 } as DOMRect);
    vi.spyOn(field, 'getBoundingClientRect').mockReturnValue({
      left: 20,
      top: 124,
      height: 74,
    } as DOMRect);
    Object.defineProperty(field, 'clientWidth', { value: 280 });
    expect(textareaOverlayBounds(field, parent)).toEqual({
      left: 0,
      top: 24,
      height: 74,
      width: 280,
    });
  });
  it('reserves the native scrollbar and accounts for parent scrolling', () => {
    const parent = document.createElement('div');
    const field = document.createElement('textarea');
    parent.scrollTop = 50;
    vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 100 } as DOMRect);
    vi.spyOn(field, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 120,
      height: 80,
    } as DOMRect);
    Object.defineProperty(field, 'clientWidth', { value: 265 });
    Object.defineProperty(field, 'clientLeft', { value: 1 });
    expect(textareaOverlayBounds(field, parent)).toMatchObject({ top: 70, width: 267 });
  });
});
