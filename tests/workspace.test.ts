import { expect, it } from 'vitest';

import { defaultTabLayout, orderItems, readWorkspace, withPreviewWidth } from '@/features/Workspace/model';
import { applyWorkspace, collectWorkspace, isNativeScript } from '@/features/Workspace/native';

it('applies an explicit 50/50 split even with Forge’s inline width and an accordion wrapper', () => {
  const tab = document.createElement('section');
  tab.innerHTML = '<div class="gradio-row" style="grid-template-columns: 2fr 1fr"><div><div id="txt2img_settings"></div></div><div id="txt2img_results"></div></div>';
  const saved = withPreviewWidth({ layout: { img2img: { ...defaultTabLayout, previewWidth: 60 } }, presets: [] }, 'txt2img', 50);
  const { layout } = readWorkspace(JSON.stringify(saved));
  applyWorkspace(tab, 'txt2img', layout.txt2img!);
  const row = tab.firstElementChild as HTMLElement;
  expect(row.dataset.lobeWorkspaceColumns).toBe('custom');
  expect(row.style.getPropertyValue('--lobe-workspace-preview')).toBe('50fr');
  expect(layout.img2img?.previewWidth).toBe(60);
});

it('rearranges and hides optional controls without moving Gradio nodes or altering Script', () => {
  const tab = document.createElement('section');
  tab.innerHTML = `
    <div><div id="txt2img_settings">
      <div id="txt2img_accordions"><div class="gradio-accordion" id="txt2img_hr"><div class="label-wrap"><span>Hires. fix</span></div></div></div>
      <div id="txt2img_seed_row"><input value="42"></div>
      <div id="txt2img_script_container"><div class="styler">
        <div class="gradio-group"><div class="styler"><div class="gradio-accordion"><div class="label-wrap"><span>Extension</span></div></div></div></div>
        <div class="form"><div id="script_list"><input value="X/Y/Z plot"></div></div>
        <div class="gradio-group"><div class="styler"><div class="xyz_entries"><input value="10, 20"></div></div></div>
      </div></div>
    </div><div id="txt2img_results"></div></div>
    <div id="txt2img_actions_column"><div id="txt2img_generate_box"><button>Generate</button></div><div id="txt2img_enqueue_wrapper"></div></div>
  `;
  const catalog = collectWorkspace(tab, 'txt2img');
  const [extension] = catalog.extensions;
  expect(extension.label).toBe('Extension');
  expect(isNativeScript(extension.elements[0])).toBe(false);
  const xyz = tab.querySelector<HTMLInputElement>('.xyz_entries input')!;
  const script = tab.querySelector<HTMLInputElement>('#script_list input')!;
  const originalParent = xyz.parentElement;
  expect(isNativeScript(xyz)).toBe(true);
  expect(isNativeScript(script)).toBe(true);

  applyWorkspace(tab, 'txt2img', {
    ...defaultTabLayout,
    groups: {
      commands: { hidden: ['generate', 'queue'], order: ['queue', 'generate'] },
      extensions: { hidden: [extension.id], order: [extension.id] },
      parameters: { hidden: ['txt2img_hr'], order: ['seed', 'txt2img_hr'] },
    },
    placement: 'previewLeft',
  });
  expect(tab.querySelector('#txt2img_hr')?.hasAttribute('data-lobe-workspace-hidden')).toBe(true);
  expect(tab.querySelector('#txt2img_generate_box')?.hasAttribute('data-lobe-workspace-hidden')).toBe(false);
  expect(tab.querySelector('#txt2img_enqueue_wrapper')?.hasAttribute('data-lobe-workspace-hidden')).toBe(true);
  expect(Object.hasOwn(extension.elements[0].dataset, 'lobeWorkspaceHidden')).toBe(true);
  expect(xyz.value).toBe('10, 20');
  expect(xyz.parentElement).toBe(originalParent);
  expect(xyz.closest('[data-lobe-workspace-hidden], [data-lobe-workspace-order]')).toBeNull();

  applyWorkspace(tab, 'txt2img', defaultTabLayout);
  expect(tab.querySelector('[data-lobe-workspace-hidden]')).toBeNull();
  expect(tab.querySelector('#txt2img_hr')?.hasAttribute('data-lobe-workspace-order')).toBe(false);
  expect(script.value).toBe('X/Y/Z plot');
});

it.each(['txt2img', 'img2img'] as const)('puts sampling, seed and resolution first by default in %s', (name) => {
  const tab = document.createElement('section');
  tab.innerHTML = `<div id="${name}_settings">
    <div id="${name}_ar_panel"></div>
    <div id="${name}_accordions"><div class="gradio-accordion"><div class="label-wrap"><span>Optional</span></div></div></div>
    <div id="${name}_seed_row"></div>
    <div id="${name}_seed_extras" hidden></div>
    <div id="sampling-wrapper"><div id="sampler_selection_${name}"></div></div>
  </div>`;
  const rank = (id: string) => Number(tab.querySelector<HTMLElement>(`#${id}`)?.style.getPropertyValue('--lobe-workspace-order'));
  applyWorkspace(tab, name, defaultTabLayout);
  expect(rank('sampling-wrapper')).toBeLessThan(rank(`${name}_seed_row`));
  expect(rank(`${name}_seed_row`)).toBe(rank(`${name}_seed_extras`));
  expect(rank(`${name}_seed_row`)).toBeLessThan(rank(`${name}_ar_panel`));
  expect(rank(`${name}_ar_panel`)).toBeLessThan(rank(`${name}_accordions`));
  applyWorkspace(tab, name, { ...defaultTabLayout, groups: { parameters: { hidden: [], order: ['resolution', 'seed'] } } });
  expect(rank(`${name}_ar_panel`)).toBeLessThan(rank(`${name}_seed_row`));
});

it('restores saved layouts defensively and keeps new controls available', () => {
  const raw = JSON.stringify({
    layout: { txt2img: { groups: { parameters: { hidden: ['seed', '.bad'], order: ['seed', 'seed'] } }, placement: 'bad', previewWidth: 105 } },
    presets: [{ layout: {}, name: ' Layout ' }, { layout: {}, name: 'Layout' }],
  });
  const result = readWorkspace(raw);
  expect(result.layout.txt2img).toEqual({
    groups: { parameters: { hidden: ['seed'], order: ['seed'] } },
    placement: 'native', previewWidth: 70,
  });
  expect(result.presets.map(({ name }) => name)).toEqual(['Layout']);
  expect(orderItems([{ id: 'new' }, { id: 'seed' }], ['seed']).map(({ id }) => id)).toEqual(['seed', 'new']);
});

it('keeps TIPO fields editable independently and discovers extensions with supporting controls', () => {
  const tab = document.createElement('section');
  tab.innerHTML = `<div id="txt2img_prompt_container">
    <div id="txt2img_prompt_row"><textarea>original</textarea></div>
    <div class="gradio-row"><div class="gradio-column"><div class="gradio-textbox"><textarea placeholder="Tag Prompt for TIPO">tags</textarea></div></div>
      <div class="gradio-column"><div class="gradio-textbox"><textarea placeholder="Natural Language Prompt for TIPO">text</textarea></div></div></div>
    </div>
    <div id="txt2img_script_container"><div class="styler">
      <div class="gradio-group"><div class="styler"><div class="gradio-row"><div class="gradio-accordion" id="my_ext">
        <div class="label-wrap"><span>Extension A</span></div></div></div><button>Aux</button></div></div>
      <div class="form"><div id="script_list"></div></div>
      <div class="gradio-group"><div class="gradio-accordion"><div class="label-wrap"><span>Selectable script</span></div></div></div>
    </div></div>`;
  const catalog = collectWorkspace(tab, 'txt2img');
  expect(catalog.extensions.map((item) => item.label)).toEqual(['Extension A']);
  expect(catalog.promptFields.map((item) => item.id)).toEqual(['tipoTag', 'tipoNatural']);
  applyWorkspace(tab, 'txt2img', {
    ...defaultTabLayout,
    groups: { promptFields: { hidden: ['tipoTag'], order: ['tipoNatural', 'tipoTag'] } },
    promptHeights: { positive: 144, tipoNatural: 96 },
  });
  expect(catalog.promptFields[0].elements[0].dataset.lobeWorkspaceHidden).toBe('true');
  expect(catalog.promptFields[1].elements[0].style.getPropertyValue('--lobe-prompt-height')).toBe('96px');
  expect(tab.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe('original');
});

it('uses the original Gradio metadata for translated TIPO fields and accordion identities', () => {
  const tab = document.createElement('section');
  tab.innerHTML = `
    <div id="txt2img_prompt_container"><div class="gradio-row">
      <div class="gradio-textbox" id="component-21"><textarea placeholder="Теги"></textarea></div>
      <div class="gradio-textbox" id="component-22"><textarea placeholder="Описание"></textarea></div>
    </div></div>
    <div id="txt2img_script_container"><div class="styler">
      <div class="gradio-accordion" id="component-23"><div class="label-wrap"><span>Extension A</span></div></div>
      <div class="form"><div id="script_list"></div></div>
    </div></div>`;
  const previous = window.gradio_config;
  try {
    Object.assign(window, { gradio_config: { components: [
      { id: 21, props: { placeholder: 'Tag Prompt for TIPO' } },
      { id: 22, props: { placeholder: 'Natural Language Prompt for TIPO' } },
      { id: 23, props: { label: 'Extension A' } },
    ] } });
    const initial = collectWorkspace(tab, 'txt2img');
    tab.querySelector('.label-wrap span')!.textContent = 'Расширение А';
    const translated = collectWorkspace(tab, 'txt2img');
    expect(translated.promptFields.map(({ id }) => id)).toEqual(['tipoTag', 'tipoNatural']);
    expect(translated.extensions[0]).toMatchObject({ id: initial.extensions[0].id, label: 'Расширение А' });
  } finally {
    window.gradio_config = previous;
  }
});
