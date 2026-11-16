import { afterEach, expect, it, vi } from 'vitest';

import { startPerformanceDiagnostics } from '@/utils/performanceDiagnostics';

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
  document.body.replaceChildren();
});

it('does not feed observed long tasks back into Forge DOM mutation callbacks', () => {
  window.history.replaceState(null, '', '/?lobe_perf=1');
  let receive: (entries: { getEntries: () => { duration: number }[] }) => void = () => {};
  vi.stubGlobal(
    'PerformanceObserver',
    class {
      static supportedEntryTypes = ['longtask'];
      constructor(callback: typeof receive) {
        receive = callback;
      }
      observe() {}
    },
  );
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => callback(0));
  startPerformanceDiagnostics();
  const output = document.querySelector('output')!;
  const initial = output.textContent;
  receive({ getEntries: () => [{ duration: 200 }] });
  expect(output.textContent).toBe(initial);
  window.dispatchEvent(new Event('resize'));
  expect(JSON.parse(output.textContent!)).toMatchObject({ longTasks: 1, longestTask: 200 });
});

it('adds no observers or UI in normal use', () => {
  const observer = vi.fn();
  vi.stubGlobal('PerformanceObserver', observer);
  startPerformanceDiagnostics();
  expect(observer).not.toHaveBeenCalled();
  expect(document.querySelector('#lobe-performance-report')).toBeNull();
});
