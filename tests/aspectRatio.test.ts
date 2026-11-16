import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const source = readFileSync(resolve(process.cwd(), 'javascript/aspect_ratio.js'), 'utf8');
let api: any;
beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '';
  localStorage.clear();
  delete (window as any).lobeThemeSetting;
  delete (window as any).lobeThemeSetSetting;
  (window as any).opts = { lobe_enable_aspect_ratio: true, localization: 'en_US' };
  // Inspect the closure without changing the shipped standalone script.
  window.eval(
    source.replace(
      /\}\)\(\);\s*$/,
      'window.__aspectTest = { isAspectRatioEnabled, getAspectRatioViewMode, getLocale, setAspectRatioViewMode, positionPopover, createAspectRatioPanel, createPopoverElement, updatePresetVisibility, organizeGenerationParams, checkDynamicLayoutState, watchDistilledVisibility, initTabControls };})();',
    ),
  );
  api = (window as any).__aspectTest;
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Aspect Ratio settings', () => {
  it('reflects a native preset update to the batch slider value and frame bounds', async () => {
    const slider = (id: string, value: number, max = 8) =>
      `<div class="gradio-slider" id="txt2img_${id}"><input type="number" min="1" max="${max}" step="1" value="${value}"><input type="range" min="1" max="${max}" step="1" value="${value}"></div>`;
    document.body.innerHTML = `<div id="txt2img_settings"><div class="form"><div id="txt2img_column_size">${slider('width', 1024, 2048)}${slider('height', 1024, 2048)}</div>${slider('batch_count', 1)}${slider('batch_size', 2)}</div></div>`;
    expect(api.initTabControls('txt2img')).toBe(true);
    const number = document.querySelector<HTMLInputElement>('#txt2img_ar_bsize_num')!;
    const range = document.querySelector<HTMLInputElement>('#txt2img_ar_bsize_slider')!;
    expect(number.value).toBe('2');
    const native = document.querySelector<HTMLInputElement>('#txt2img_batch_size input[type=range]')!;
    native.max = '121';
    native.step = '8';
    native.value = '17';
    document.querySelector<HTMLInputElement>('#txt2img_batch_size input[type=number]')!.value = '17';
    native.style.backgroundSize = '13% 100%';
    await Promise.resolve();
    expect(number.value).toBe('17');
    expect(range.value).toBe('17');
    expect(range.max).toBe('121');
    expect(range.step).toBe('8');
    expect(range.getAttribute('aria-label')).toBe('Frames');
    vi.stubGlobal("lobeTranslate", (key: string, fallback: string) =>
      key === "aspectPanel.frames" ? "Кадры" : fallback,
    );
    window.dispatchEvent(new Event("lobe:language"));
    expect(document.querySelector('[data-i18n="frames"]')).toHaveTextContent("Кадры");
    expect(number).toHaveAttribute("aria-label", "Кадры");
    expect(range).toHaveAttribute("aria-label", "Кадры");
  });

  it('applies the same family preferences to preset buttons and the popover', () => {
    const panel = api.createAspectRatioPanel('txt2img') as HTMLElement;
    const popover = api.createPopoverElement('txt2img') as HTMLElement;
    const visibleFamilies = (element: HTMLElement) =>
      new Set([...element.querySelectorAll<HTMLButtonElement>('button[data-family]:not([hidden])')]
        .map((button) => button.dataset.family));

    api.updatePresetVisibility(panel, popover);
    expect(visibleFamilies(panel)).toEqual(new Set(['XL']));
    expect(visibleFamilies(popover)).toEqual(new Set(['XL']));

    (window as any).lobeThemeSetting = { resolutionPresetsXL: false, resolutionPresetsSD15: true, resolutionPresetsWan: true };
    api.updatePresetVisibility(panel, popover);
    expect(visibleFamilies(panel)).toEqual(new Set(['SD15', 'Wan']));
    expect(visibleFamilies(popover)).toEqual(new Set(['SD15', 'Wan']));

    (window as any).lobeThemeSetting = { resolutionPresetsXL: false };
    api.updatePresetVisibility(panel, popover);
    expect(visibleFamilies(panel).size).toBe(0);
    expect(popover.querySelector('.sd-ar-presets-empty')).not.toHaveAttribute('hidden');
  });

  it('restores native sampling controls independently of the resolution panel', () => {
    document.body.innerHTML = '<div id="sampler_selection_txt2img"><div class="form"></div></div><div id="original"><div id="txt2img_cfg_scale"></div><button id="extension-control"></button></div>';
    const original = document.querySelector('#original')!;
    const cfg = document.querySelector('#txt2img_cfg_scale')!;
    (window as any).lobeThemeSetting = { enableAspectRatio: false, enhanceSampling: true };
    api.organizeGenerationParams('txt2img');
    expect(cfg.closest('#sampler_selection_txt2img')).toBeTruthy();
    expect(original).toHaveClass('sd-ar-sampling-source');

    (window as any).lobeThemeSetting = { enableAspectRatio: true, enhanceSampling: false };
    api.organizeGenerationParams('txt2img');
    expect(original.firstElementChild).toBe(cfg);
    expect(original).not.toHaveClass('sd-ar-sampling-source');
  });

  it('gives canonical theme settings priority over Forge opts and old local keys', () => {
    (window as any).lobeThemeSetting = {
      enableAspectRatio: false,
      aspectRatioMode: 'dropdown',
      i18n: 'ru_RU',
    };
    localStorage.setItem('lobe_ratio_default_view', 'buttons');
    expect(api.isAspectRatioEnabled()).toBe(false);
    expect(api.getAspectRatioViewMode()).toBe('dropdown');
    expect(api.getLocale()).toBe('ru_RU');
  });
  it('uses the queued React settings bridge', async () => {
    const save = vi.fn(async (patch) => {
      (window as any).lobeThemeSetting = patch;
    });
    (window as any).lobeThemeSetSetting = save;
    await api.setAspectRatioViewMode('buttons');
    expect(save).toHaveBeenCalledWith({ aspectRatioMode: 'buttons' });
    expect(api.getAspectRatioViewMode()).toBe('buttons');
  });
  it('does not cache a rejected mode change', async () => {
    (window as any).lobeThemeSetting = { aspectRatioMode: 'dropdown' };
    (window as any).lobeThemeSetSetting = vi.fn().mockRejectedValue(new Error('offline'));
    const panel = api.createAspectRatioPanel("txt2img") as HTMLElement;
    document.body.append(panel);
    vi.stubGlobal("lobeTranslate", (key: string, fallback: string) =>
      key === "aspectPanel.saveModeError" ? "Не удалось сохранить режим отображения." : fallback,
    );
    await api.setAspectRatioViewMode("buttons", panel);
    expect(panel.querySelector('[role="alert"]')).toHaveTextContent("Не удалось сохранить режим отображения.");
    expect(api.getAspectRatioViewMode()).toBe("dropdown");
    expect(localStorage.getItem('SD-LOBE-SETTING')).toBeNull();
  });
  it('keeps popovers inside a narrow viewport', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 320 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 640 });
    const trigger = document.createElement('button');
    trigger.getBoundingClientRect = () => ({ left: 280, top: 590, bottom: 620 }) as DOMRect;
    const popover = document.createElement('div');
    document.body.append(trigger, popover);
    api.positionPopover(trigger, popover);
    expect(parseFloat(popover.style.left) + parseFloat(popover.style.width)).toBeLessThanOrEqual(
      304,
    );
    expect(parseFloat(popover.style.top)).toBeGreaterThanOrEqual(16);
  });

  it('follows native Distilled CFG visibility without forcing layout, even inside an inactive tab', async () => {
    document.body.innerHTML = '<div style="display:none"><div id="sampler_selection_txt2img"><div class="form"></div></div><div id="original"><div id="txt2img_distilled_cfg_scale" class="hidden"></div></div></div>';
    const control = document.querySelector<HTMLElement>('#txt2img_distilled_cfg_scale')!;
    const sampler = document.querySelector('#sampler_selection_txt2img')!;
    Object.defineProperty(control, 'offsetParent', { get: () => { throw new Error('Forced layout'); } });
    api.watchDistilledVisibility();
    api.checkDynamicLayoutState();
    expect(sampler).not.toHaveClass('has-distilled-cfg');
    control.classList.remove('hidden');
    await Promise.resolve();
    expect(sampler).toHaveClass('has-distilled-cfg');
    expect(sampler.contains(control)).toBe(true);
    control.classList.add('hidden');
    await Promise.resolve();
    expect(sampler).not.toHaveClass('has-distilled-cfg');
    expect(control.parentElement?.id).toBe('original');
  });
});
