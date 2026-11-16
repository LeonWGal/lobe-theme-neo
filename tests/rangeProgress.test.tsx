import { act, fireEvent, renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';

import { syncRangeProgress, useRangeProgress } from '@/hooks/useRangeProgress';

it('keeps the native slider, numeric value and progress synchronized without replacing events', async () => {
  document.body.innerHTML = '<input type="range" min="10" max="50" value="20">';
  const range = document.querySelector('input')!;
  const view = renderHook(useRangeProgress);
  expect(range.style.getPropertyValue('--lobe-range-progress')).toBe('25%');
  fireEvent.input(range, { target: { value: '40' } });
  expect(range.value).toBe('40');
  expect(range.style.getPropertyValue('--lobe-range-progress')).toBe('75%');
  await act(async () => {
    range.max = '70';
  });
  expect(range.style.getPropertyValue('--lobe-range-progress')).toBe('50%');
  await act(async () => {
    range.value = '55';
    range.style.backgroundSize = '75% 100%';
  });
  expect(range.style.getPropertyValue('--lobe-range-progress')).toBe('75%');
  view.unmount();
});

it('initializes controls mounted by an extension later and guards degenerate bounds', async () => {
  const view = renderHook(useRangeProgress);
  const range = document.createElement('input');
  range.type = 'range';
  range.min = '5';
  range.max = '5';
  await act(async () => document.body.append(range));
  expect(range.style.getPropertyValue('--lobe-range-progress')).toBe('0%');
  range.max = '15';
  range.value = '10';
  syncRangeProgress(range);
  expect(range.style.getPropertyValue('--lobe-range-progress')).toBe('50%');
  view.unmount();
  range.remove();
});
