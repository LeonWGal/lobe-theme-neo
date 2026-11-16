import { readFileSync } from 'node:fs';
import { expect, it, vi } from 'vitest';

const bridge = readFileSync('javascript/lobe_prompt_updates.js', 'utf8');

it('skips prompt-only updates while forwarding native changes and keeping pending work', () => {
  const root = document.createElement('div');
  root.innerHTML = '<div class="autocompleteParent"><ul></ul></div><button></button>';
  const prompt = { target: root.querySelector('ul') };
  const native = { target: root.querySelector('button') };
  const run = vi.fn();
  const schedule = vi.fn();
  const load = new Function(
    'executeCallbacks', 'scheduleAfterUiUpdateCallbacks', 'document',
    `const uiUpdateCallbacks = [];
     ${bridge}
     return records => {
       executeCallbacks(uiUpdateCallbacks, records);
       scheduleAfterUiUpdateCallbacks();
     };`,
  );
  const dispatch = load(run, schedule, { addEventListener: vi.fn() });

  dispatch([prompt]);
  expect(run).not.toHaveBeenCalled();
  expect(schedule).not.toHaveBeenCalled();
  dispatch([prompt, native]);
  expect(run).toHaveBeenCalledWith(expect.any(Array), [native]);
  expect(schedule).toHaveBeenCalledTimes(1);
});
