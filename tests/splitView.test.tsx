import { act, render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import SplitView from '@/features/Content/SplitView';

it('keeps Generate and Enqueue with compact prompts across preview modes', () => {
  document.body.innerHTML =
    '<div id="tabs"><div id="txt2img_settings"><div id="txt2img_prompt_container"></div></div>' +
    '<div id="native_actions">' +
    '<div id="txt2img_generate_box"></div><div id="txt2img_enqueue_wrapper"></div></div>' +
    '<div id="txt2img_gallery_container"></div></div>';
  const view = render(<SplitView txt2img="stackedSplit" />);
  expect(document.querySelector('#txt2img_toprow #txt2img_generate_box')).toBeTruthy();
  expect(
    document.querySelector('#txt2img_toprow #txt2img_enqueue_wrapper'),
  ).toBeTruthy();
  view.rerender(<SplitView txt2img="split" />);
  expect(document.querySelector('#txt2img_actions_column #txt2img_generate_box')).toBeTruthy();
  expect(document.querySelector('#txt2img_actions_column #txt2img_enqueue_wrapper')).toBeTruthy();
  expect(document.querySelector('#txt2img_toprow')?.parentElement?.id).toBe('txt2img_settings');
  expect(document.querySelector('.lobe-split-action-header')).toBeNull();
  view.unmount();
  expect(document.querySelector('#native_actions #txt2img_generate_box')).toBeTruthy();
  expect(document.querySelector('#txt2img_settings > #txt2img_prompt_container')).toBeTruthy();
});

it('moves and restores the complete Extras generation box, including cancellation controls', () => {
  document.body.innerHTML =
    '<div id="tabs"><div id="extras_actions"><div id="extras_generate_box"><button id="extras_interrupt"></button><button id="extras_generate"></button></div></div><div id="extras_original_results"><div id="extras_results"></div></div></div>';
  const view = render(<SplitView />);
  expect(
    document.querySelector('#extras_results #extras_generate_box #extras_interrupt'),
  ).toBeTruthy();
  view.unmount();
  expect(
    document.querySelector('#extras_actions #extras_generate_box #extras_interrupt'),
  ).toBeTruthy();
  expect(document.querySelector('#extras_original_results')).toBeTruthy();
});

it('ignores gallery content updates and batches late layout controls into one frame', async () => {
  document.body.innerHTML = '<div id="tabs"><div id="txt2img_gallery_container"></div></div>';
  const frames: FrameRequestCallback[] = [];
  const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  const search = vi.spyOn(document, 'querySelector');
  const view = render(<SplitView txt2img="stackedSplit" />);
  search.mockClear();
  await act(async () => {
    document.getElementById('txt2img_gallery_container')!.innerHTML = '<div>Preview</div>'.repeat(
      100,
    );
  });
  expect(search).not.toHaveBeenCalled();
  expect(frames).toHaveLength(0);
  await act(async () => {
    const tabs = document.getElementById('tabs')!;
    tabs.insertAdjacentHTML('beforeend', '<div id="txt2img_settings"></div>');
    tabs.insertAdjacentHTML('beforeend', '<div id="txt2img_generate_box"></div>');
  });
  expect(frames).toHaveLength(1);
  await act(async () => frames[0](0));
  expect(document.querySelector('#txt2img_gallery_container #txt2img_generate_box')).toBeTruthy();
  view.unmount();
  raf.mockRestore();
  search.mockRestore();
});

it('switches preview mode live and keeps the same editable prompt and queue nodes', () => {
  document.body.innerHTML = `<div id="tabs"><div id="tab_txt2img">
    <div id="prompt_host"><div id="txt2img_toprow"><textarea></textarea><div id="txt2img_actions_column">
      <div id="txt2img_generate_box"></div><div id="txt2img_enqueue_wrapper"></div>
    </div></div></div>
    <div id="generation-row" class="gradio-row"><div id="txt2img_settings"></div>
      <div id="txt2img_results"><div id="txt2img_gallery_container"></div></div></div>
  </div></div>`;
  const textarea = document.querySelector('textarea')!;
  const queue = document.querySelector('#txt2img_enqueue_wrapper')!;
  textarea.value = 'unsaved prompt';
  const view = render(<SplitView extras={false} img2img="off" txt2img="stacked" />);
  expect(textarea.closest('#txt2img_settings')).toBeTruthy();
  expect(queue.closest('#txt2img_toprow')?.parentElement?.id).toBe('txt2img_settings');
  view.rerender(<SplitView extras={false} img2img="off" txt2img="stackedSplit" />);
  expect(queue.closest('#txt2img_toprow')?.parentElement?.id).toBe('txt2img_settings');
  expect(document.querySelector('textarea')).toBe(textarea);
  expect(textarea.value).toBe('unsaved prompt');
  view.rerender(<SplitView extras={false} img2img="off" txt2img="off" />);
  expect(textarea.closest('#prompt_host')).toBeTruthy();
  expect(queue.closest('#txt2img_actions_column')).toBeTruthy();
  expect(document.querySelector('.lobe-split-action-header')).toBeNull();
  view.unmount();
});

it('keeps the original Generate controls beside Enqueue after Forge moves them on resize', async () => {
  document.body.innerHTML = `<div id="tabs">
    <div id="txt2img_toprow"><div id="txt2img_actions_column">
      <div id="txt2img_generate_box"><button id="txt2img_generate"></button></div>
      <div id="txt2img_enqueue_wrapper"></div>
    </div></div>
    <div id="txt2img_results"></div>
  </div>`;
  const generate = document.getElementById('txt2img_generate_box')!;
  const button = document.getElementById('txt2img_generate');
  const actions = document.getElementById('txt2img_actions_column')!;
  const results = document.getElementById('txt2img_results')!;
  const frames: FrameRequestCallback[] = [];
  const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  const view = render(<SplitView extras={false} img2img="off" txt2img="off" />);
  try {
    await act(async () => { results.prepend(generate); });
    expect(frames).toHaveLength(1);
    await act(async () => frames[0](0));
    expect(actions.firstElementChild).toBe(generate);
    expect(generate.firstElementChild).toBe(button);
  } finally {
    view.unmount();
    raf.mockRestore();
  }
});
