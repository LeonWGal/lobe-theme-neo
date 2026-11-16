import { readFileSync } from 'node:fs';
import { expect, it, vi } from 'vitest';

const bridge = readFileSync('javascript/lobe_queue_bridge.js', 'utf8');

it('captures each tag seed by Gradio component id and uses random seed for an empty field', () => {
  const root = document.createElement('div');
  root.innerHTML = `
    <div id="component-1078"><input type="number" value="73"></div>
    <div id="component-1118"><input type="number"></div>
  `;
  const capture = new Function('findEl', `
    ${bridge.slice(bridge.indexOf('  function getCompById('), bridge.indexOf('  function isADetailerBuilderDep('))}
    ${bridge.slice(bridge.indexOf('  function captureTagSeeds('), bridge.indexOf('  function xyzElemIds('))}
    return captureTagSeeds;
  `)((selector: string) => root.querySelector(selector));
  const cfg = { components: [1078, 1118, 1200].map((id) => ({
    id, type: 'number', props: { label: 'Seed for upsampling tags' },
  })) };
  const args = ['stale value', '', '9'];
  capture(args, cfg, [1078, 1118, 1200]);
  expect(args).toEqual(['73', -1, '9']);
});

it('trims callback outputs even when the active generation has no gallery yet', () => {
  const expose = bridge.replace(/\}\)\(\);\s*$/, 'window.trimGenerateArgs = trimGenerateArgs; })();');
  const host = { fetch: vi.fn(), trimGenerateArgs: (_args: unknown[], _inputs: number, _outputs: number) => [] };
  class StubRequest {
    open() {}
    send() {}
  }
  new Function('window', 'document', 'XMLHttpRequest', expose)(host, document, StubRequest);

  const args = ['job', 'prompt', '42', ['extension choice'], null, null, false];
  expect(host.trimGenerateArgs(args, args.length, 5)).toEqual(args);
  expect(host.trimGenerateArgs([...args, null, null, '{}', '', ''], args.length, 5)).toEqual(args);
});

it('always supplies one Gradio restore input and uses each queued job only once', () => {
  let active: string | undefined;
  const textboxData: unknown[] = [];
  const root = document.createElement('div');
  root.innerHTML = '<button id="txt2img_restore_progress"></button>';
  const host = {
    fetch: vi.fn(),
    restoreProgressImg2img: vi.fn(() => undefined),
    restoreProgressTxt2img: vi.fn(() => active),
    lobeQueueShowResult: (_tab: string, _job: string) => {},
  };
  class StubRequest {
    open() {}
    send() {}
  }
  const timers: Array<() => void> = [];
  const load = new Function('window', 'document', 'XMLHttpRequest', 'gradioApp', 'localGet', 'setTimeout', bridge);
  load(host, document, StubRequest, () => root, () => active,
    (callback: () => void) => timers.push(callback));
  root.querySelector('button')?.addEventListener('click', () => {
    textboxData.push(host.restoreProgressTxt2img());
  });

  expect(host.restoreProgressImg2img()).toEqual([null]);
  host.lobeQueueShowResult('txt2img', 'queued-job');
  expect(textboxData).toEqual([['queued-job']]);
  expect(host.restoreProgressTxt2img()).toEqual([null]);

  active = 'native-job';
  host.lobeQueueShowResult('txt2img', 'queued-while-busy');
  expect(textboxData).toHaveLength(1);
  expect(host.restoreProgressTxt2img()).toEqual(['native-job']);

  active = undefined;
  const button = root.querySelector('button')!;
  const simulateDeferredClick = vi.spyOn(button, 'click').mockImplementation(() => {});
  host.lobeQueueShowResult('txt2img', 'expired-job');
  expect(simulateDeferredClick).toHaveBeenCalledOnce();
  timers.forEach((callback) => callback());
  expect(host.restoreProgressTxt2img()).toEqual([null]);
});

it('enqueues directly from DOM and config even when the Generate button is disabled during active generation', async () => {
  const root = document.createElement('div');
  root.innerHTML = `
    <button id="txt2img_generate" disabled style="display:none"></button>
    <div id="txt2img_prompt"><textarea>masterpiece, best quality</textarea></div>
    <div id="txt2img_neg_prompt"><textarea>lowres, bad anatomy</textarea></div>
    <div id="txt2img_steps"><input type="number" value="28"></div>
    <div id="txt2img_hr-checkbox"><input type="checkbox" checked></div>
  `;
  const cfg = {
    components: [
      { id: 1, type: 'button', props: { elem_id: 'txt2img_generate' } },
      { id: 10, type: 'textbox', props: { elem_id: 'txt2img_task_id', value: '' } },
      { id: 11, type: 'textbox', props: { elem_id: 'txt2img_prompt', value: 'stale' } },
      { id: 12, type: 'textbox', props: { elem_id: 'txt2img_neg_prompt', value: 'stale neg' } },
      { id: 13, type: 'slider', props: { elem_id: 'txt2img_steps', value: 20 } },
      { id: 14, type: 'checkbox', props: { elem_id: 'txt2img_hr-checkbox', value: false } },
    ],
    dependencies: [
      {
        id: 0,
        targets: [[1, 'click']],
        inputs: [10, 11, 12, 13, 14],
        outputs: [99],
      },
    ],
  };

  let postedBody: Record<string, unknown> | null = null;
  const host: Record<string, unknown> = {
    gradio_config: cfg,
    fetch: vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/config/') {
        return { ok: true, json: async () => cfg };
      }
      if (url === '/lobe/queue/ui') {
        postedBody = JSON.parse(String(init?.body || '{}'));
        return { ok: true, json: async () => ({ id: 'q-123', status: 'pending' }) };
      }
      throw new Error('Unexpected fetch: ' + url);
    }),
    dispatchEvent: vi.fn(),
  };
  class StubRequest {
    open() {}
    send() {}
  }

  const load = new Function(
    'window',
    'document',
    'XMLHttpRequest',
    'gradioApp',
    'fetch',
    bridge
  );
  load(host, document, StubRequest, () => root, host.fetch);

  const enqueue = host.lobeEnqueue as (
    tab: string,
    selection: { checkpoint: string | null; mode: 'queue' | 'hold' }
  ) => Promise<unknown>;
  const res = await enqueue('txt2img', { checkpoint: null, mode: 'queue' });
  expect(res).toEqual({ id: 'q-123', status: 'pending' });
  expect(postedBody).not.toBeNull();
  expect(postedBody!.is_img2img).toBe(false);
  expect(postedBody!.mode).toBe('queue');
  const args = postedBody!.args as unknown[];
  expect(args).toHaveLength(5);
  expect(String(args[0])).toMatch(/^task\(/);
  expect(args[1]).toBe('masterpiece, best quality');
  expect(args[2]).toBe('lowres, bad anatomy');
  expect(args[3]).toBe(28);
  expect(args[4]).toBe(true);
});
