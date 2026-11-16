/** Opt-in, local UI timing report. It never reads prompts, model names or settings. */
export function startPerformanceDiagnostics() {
  if (!new URLSearchParams(window.location.search).has('lobe_perf')) return;
  const output = document.createElement('output');
  output.id = 'lobe-performance-report';
  output.style.cssText =
    'position:fixed;right:12px;bottom:12px;z-index:2000;pointer-events:none;padding:6px 10px;border-radius:6px;background:#202124;color:#fff;font:12px monospace';
  document.body.append(output);
  const report = { hover: 0, input: 0, longTasks: 0, longestTask: 0, resize: 0 };
  const paint = () => {
    output.value = JSON.stringify(report);
  };
  const measure = (key: 'hover' | 'resize' | 'input') => {
    const start = performance.now();
    requestAnimationFrame(() => {
      report[key] = Math.round(performance.now() - start);
      paint();
    });
  };
  document.addEventListener(
    'pointerover',
    (event) => {
      if (
        event.target instanceof Element &&
        event.target.closest('.lobe-sidebar-edge, .lobe-sidebar-toggle')
      )
        measure('hover');
    },
    true,
  );
  window.addEventListener('resize', () => measure('resize'));
  document.addEventListener('input', () => measure('input'), true);
  if (
    typeof PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes.includes('longtask')
  ) {
    new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        report.longTasks++;
        report.longestTask = Math.max(report.longestTask, Math.round(entry.duration));
      }
      // Painting here would trigger Forge's DOM observer and another long task.
    }).observe({ buffered: false, type: 'longtask' });
  }
  paint();
}
