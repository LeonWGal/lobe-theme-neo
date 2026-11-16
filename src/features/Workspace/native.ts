import { markTipoFields, originalNativeLabel } from '@/utils/nativeLocale';

import { type TabLayout, type WorkspaceGroup, type WorkspaceTab, defaultParameterOrder, orderItems } from './model';

export interface WorkspaceItem {
  elements: HTMLElement[];
  id: string;
  label?: string;
  locked?: boolean;
}
export type Catalog = Record<WorkspaceGroup, WorkspaceItem[]>;

const accordion = '.gradio-accordion, .input-accordion, details.accordion';
const scripts = '#txt2img_script_container, #img2img_script_container';
const direct = (node?: Element | null) => Array.from(node?.children ?? []) as HTMLElement[];

export function scriptBoundary(container: Element | null) {
  const host = container?.querySelector(':scope > .styler') || container;
  let branch = host?.querySelector<HTMLElement>('#script_list');
  while (branch?.parentElement && branch.parentElement !== host)
    branch = branch.parentElement;
  return branch && branch.parentElement === host ? { branch, children: direct(host) } : undefined;
}

export function isNativeScript(node: Element): boolean {
  const container = node.closest(scripts);
  if (!container) return false;
  const boundary = scriptBoundary(container);
  if (!boundary) return true;
  return boundary.children.slice(boundary.children.indexOf(boundary.branch)).some((entry) => entry.contains(node));
}

const visibleChildren = (node: HTMLElement) =>
  direct(node.firstElementChild?.matches('.styler') ? node.firstElementChild : node)
    .filter((child) => !child.matches('.hidden, .hide, [hidden], .gradio-group:has(> .styler:only-child:empty)'));
const oneAccordion = (node: HTMLElement, depth = 0): HTMLElement | null => {
  if (node.matches(accordion)) return node;
  if (depth >= 5 || !node.matches('.gradio-group, .gradio-row, .gradio-column, .styler')) return null;
  const children = visibleChildren(node);
  return children.length === 1 ? oneAccordion(children[0], depth + 1) : null;
};
const firstSection = (node: HTMLElement): HTMLElement | null =>
  (node.matches(accordion) ? node : [...node.querySelectorAll<HTMLElement>(accordion)]
    .find((panel) => !panel.parentElement?.closest(accordion))) ?? null;

const accordionTitle = (node: HTMLElement) => {
  const head = node.querySelector(':scope > .label-wrap, :scope > summary, :scope > * > .label-wrap');
  const title = head?.querySelector(':scope > span:not(.icon)') ?? head;
  if (!title) return '';
  const text = title.cloneNode(true) as HTMLElement;
  text.querySelectorAll('.icon, .input-accordion-extra, input, button, svg').forEach((el) => el.remove());
  return (text.textContent ?? '').replaceAll(/[▼▲▶◀]+/gu, '').trim();
};
// Keep the original title hash used by existing workspace presets.
const extensionKey = (label: string) => {
  let hash = 0;
  for (const character of label.toLowerCase()) hash = (Math.imul(hash, 31) + character.codePointAt(0)!) >>> 0;
  return `extension:${(hash >>> 0).toString(36)}`;
};

export function collectWorkspace(tab: HTMLElement, name: WorkspaceTab): Catalog {
  markTipoFields(tab);
  const byId = (suffix: string) => tab.querySelector<HTMLElement>(`#${name}_${suffix}`);
  const parents = {
    commands: byId('actions_column'),
    outputTools: tab.querySelector(`#image_buttons_${name}`),
    parameters: byId('settings'),
    promptTools: byId('tools'),
    prompts: byId('prompt_container'),
  };
  const result: Catalog = { commands: [], extensions: [], output: [], outputTools: [], parameters: [], promptFields: [], promptTools: [], prompts: [] };
  const add = (group: WorkspaceGroup, id: string, element?: HTMLElement | null, locked = false, label?: string) => {
    if (!element) return;
    const existing = result[group].find((item) => item.id === id);
    if (existing) existing.elements.push(element);
    else result[group].push({ elements: [element], id, label, locked });
  };
  const named = (group: WorkspaceGroup, element: HTMLElement, panel: HTMLElement) => {
    const label = accordionTitle(panel);
    if (label) {
      const id = panel.id.replace(/^script_(txt2img|img2img)_/, 'script_');
      const key = /^[\w:-]+$/.test(id) && !/^(component|input-accordion)-\d+$/.test(id)
        ? id : extensionKey(originalNativeLabel(panel, label));
      add(group, key, element, false, label);
    }
  };
  for (const row of direct(parents.prompts)) {
    if (row.id === `${name}_prompt_row`) add('prompts', 'positive', row);
    else if (row.id === `${name}_neg_prompt_row`) add('prompts', 'negative', row);
    else if (row.querySelector('[id$="_tipo_accordion"], textarea[data-lobe-tipo-prompt], textarea[placeholder*="for TIPO"]')) {
      add('prompts', 'tipo', row);
      const fields = [...row.querySelectorAll<HTMLTextAreaElement>('textarea[data-lobe-tipo-prompt], textarea[placeholder*="for TIPO"]')];
      for (const field of fields) {
        const textbox = field.closest<HTMLElement>('.gradio-textbox');
        const column = textbox?.closest<HTMLElement>('.gradio-column');
        const isolated = column?.parentElement === row && column.querySelectorAll('textarea').length === 1;
        const id = field.dataset.lobeTipoPrompt === 'tag' || field.placeholder.startsWith('Tag Prompt')
          ? 'tipoTag' : 'tipoNatural';
        add('promptFields', id, isolated ? column : textbox);
      }
    }
  }
  const generation = byId('generate_box');
  const enqueue = byId('enqueue_wrapper');
  for (const row of [generation, enqueue, ...direct(parents.commands)]) {
    switch (row) {
    case generation: {
    add('commands', 'generate', row, true);
    break;
    }
    case enqueue: {
    add('commands', 'queue', row);
    break;
    }
    case parents.promptTools: {
    add('commands', 'promptTools', row);
    break;
    }
    default: { if (row?.id === `${name}_styles_row`) add('commands', 'styles', row);
    }
    }
  }
  const toolKeys: Record<string, string> = {
    clear_prompt: 'clearPrompt', negative_token_button: '', paste: 'paste', restore_progress: 'restoreProgress',
    style_apply: 'applyStyle', token_button: '',
  };
  for (const button of direct(parents.promptTools)) {
    const suffix = button.id.replace(`${name}_`, '');
    if (button.matches('.lobe-prompt-format-tools')) add('promptTools', 'format', button);
    else if (button.matches('.lobe-sections-toggle')) add('promptTools', 'sections', button);
    else if (toolKeys[suffix]) add('promptTools', toolKeys[suffix], button);
    else if (button.id && !(suffix in toolKeys) && button.matches('button') && (button.title || button.getAttribute('aria-label')))
      add('promptTools', button.id, button, false, button.getAttribute('aria-label') || button.title);
  }
  for (const element of direct(parents.parameters)) {
    if (element === generation || element.id.endsWith('_toprow') || element.matches(scripts)) continue;
    const panel = oneAccordion(element);
    if (element.id === `${name}_accordions`) {
      for (const child of direct(element)) if (child.matches(accordion)) named('parameters', child, child);
    } else if (element.id === `${name}_seed_row` || element.id === `${name}_seed_extras`) add('parameters', 'seed', element);
    else if (element.matches(`#${name}_ar_panel, #${name}_tabs_resize, #${name}_dimensions_row, #${name}_column_batch`) ||
      element.querySelector(`#${name}_ar_panel, #${name}_tabs_resize, #${name}_dimensions_row, #${name}_batch_count`))
      add('parameters', 'resolution', element, true);
    else if (element.matches(`#sampler_selection_${name}`) ||
      element.querySelector(`#sampler_selection_${name}, #${name}_cfg_scale`))
      add('parameters', 'sampling', element, true);
    else if (element.id === `${name}_denoising_strength`) add('parameters', 'denoise', element);
    else if (element.id.endsWith('_override_settings_row')) add('parameters', 'overrides', element);
    else if (panel) named('parameters', element, panel);
  }
  const boundary = scriptBoundary(byId('script_container'));
  if (boundary) for (const group of boundary.children.slice(0, boundary.children.indexOf(boundary.branch))) {
    const panel = firstSection(group);
    if (panel) named('extensions', group, panel);
  }
  add('output', 'preview', byId('gallery_container'));
  add('output', 'outputTools', parents.outputTools as HTMLElement | null);
  const outputNames: Record<string, string> = {
    open_folder: 'folder', send_to_extras: 'sendExtras', send_to_img2img: 'sendImg', send_to_inpaint: 'sendInpaint', upscale: 'upscale',
  };
  for (const button of direct(parents.outputTools)) {
    const suffix = button.id.replace(`${name}_`, '');
    const id = outputNames[suffix] || (button.id.startsWith('save_zip_') ? 'archive' :
      button.id.startsWith('save_') ? 'save' : button.id.startsWith('lobe_share_') ? 'share' : '');
    if (id) add('outputTools', id, button);
    else if (button.id && button.matches('button') && (button.title || button.getAttribute('aria-label')))
      add('outputTools', button.id, button, false, button.getAttribute('aria-label') || button.title);
  }
  return result;
}

export function applyWorkspace(tab: HTMLElement, name: WorkspaceTab, config: TabLayout, catalog = collectWorkspace(tab, name)) {
  tab.querySelectorAll<HTMLElement>('[data-lobe-workspace-order], [data-lobe-workspace-hidden], [data-lobe-workspace-flat], [data-lobe-prompt-field], [data-lobe-prompt-height], [data-lobe-prompt-fields], [data-lobe-extension-panel]').forEach((element) => {
    delete element.dataset.lobeWorkspaceOrder;
    delete element.dataset.lobeWorkspaceHidden;
    delete element.dataset.lobeWorkspaceFlat;
    delete element.dataset.lobePromptField;
    delete element.dataset.lobePromptFields;
    delete element.dataset.lobePromptHeight;
    delete element.dataset.lobeExtensionPanel;
    element.style.removeProperty('--lobe-prompt-height');
    element.style.removeProperty('--lobe-workspace-order');
  });
  const settings = tab.querySelector<HTMLElement>(`#${name}_settings`);
  let row = settings?.parentElement;
  while (row && row !== tab && !row.querySelector(`:scope > #${name}_results`)) row = row.parentElement;
  if (row && row !== tab && tab.contains(row)) {
    const customWidth = config.fixedPreviewWidth || config.previewWidth !== 50;
    row.dataset.lobeWorkspaceColumns = config.placement === 'native' && customWidth ? 'custom' : config.placement;
    if (!row.querySelector(':scope > .lobe-workspace-divider:is([data-dragging], [data-pending-width])')) {
      row.style.setProperty('--lobe-workspace-preview', `${config.previewWidth}fr`);
      row.style.setProperty('--lobe-workspace-parameters', `${100 - config.previewWidth}fr`);
    }
    let parameters = settings;
    while (parameters?.parentElement && parameters.parentElement !== row) parameters = parameters.parentElement;
    if (parameters) parameters.dataset.lobeWorkspaceParameterColumn = '';
  }
  for (const [group, items] of Object.entries(catalog) as [WorkspaceGroup, WorkspaceItem[]][]) {
    for (const { elements, id } of items) for (const element of elements) {
      if (group === 'extensions') element.dataset.lobeExtensionPanel = 'true';
      if (group === 'promptFields') {
        element.dataset.lobePromptField = 'true';
        const row = element.closest('[id$="_prompt_container"] > .gradio-row');
        if (row instanceof HTMLElement) row.dataset.lobePromptFields = 'true';
      }
      const height = config.promptHeights?.[id];
      if (height && (group === 'promptFields' || group === 'prompts' && id !== 'tipo')) {
        element.dataset.lobePromptHeight = 'true';
        element.style.setProperty('--lobe-prompt-height', `${height}px`);
      }
      if ((group === 'extensions' || group === 'parameters') && element.matches('.gradio-group') && oneAccordion(element))
        element.dataset.lobeWorkspaceFlat = 'true';
    }
    const options = config.groups[group];
    const customOrder = options?.order ?? [];
    const order = group === 'parameters' && !customOrder.length ? defaultParameterOrder : customOrder;
    if (group === 'parameters' && customOrder.length) {
      const wrapper = tab.querySelector<HTMLElement>(`#${name}_accordions`);
      if (wrapper) wrapper.dataset.lobeWorkspaceFlat = 'contents';
    }
    const rankedItems = customOrder.length ? items : items.filter(({ id }) => order.includes(id));
    for (const { elements, id, locked } of items) {
      if (!locked && options?.hidden.includes(id)) {
        for (const element of elements) element.dataset.lobeWorkspaceHidden = 'true';
      }
    }
    const ordered = orderItems(rankedItems, order);
    ordered.forEach(({ elements }, index) => {
      for (const element of elements) {
        element.dataset.lobeWorkspaceOrder = 'true';
        element.style.setProperty('--lobe-workspace-order', String(index - ordered.length - 1));
      }
    });
  }
  return row && row !== tab && tab.contains(row) ? row : undefined;
}
