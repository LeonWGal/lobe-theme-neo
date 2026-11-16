import { afterEach, expect, it, vi } from 'vitest';

import replaceIcons from '@/scripts/replaceIcon';
import { eraser, photoEdit } from '@/icons/tablerPaths';

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

it('reaches Forge controls moved under the Lobe root and replaces newly mounted gallery actions', async () => {
  document.body.innerHTML = `
    <gradio-app>
      <div id="root" data-lobe-localized>
        <button id="custom" aria-label="Custom emoji">📂</button>
        <div class="app" data-lobe-native-content>
          <button id="txt2img_clear_prompt" title="Clear prompt">🗑️</button>
          <section id="txt2img_script_container"><button title="Reuse seed">♻️</button></section>
          <div id="image_buttons_txt2img"></div>
          <section class="extra-network-cards"><button>🖼️</button></section>
        </div>
      </div>
    </gradio-app>
  `;
  vi.stubGlobal('gradioApp', () => document.querySelector('gradio-app'));
  const stop = replaceIcons();
  try {
    const clear = document.querySelector('#txt2img_clear_prompt')!;
    expect(clear.querySelector('svg')?.innerHTML).toContain(eraser.match(/d="([^"]+)/)?.[1]);
    expect(clear.textContent).toBe('');
    expect(document.querySelector('#txt2img_script_container svg')).not.toBeNull();
    expect(document.querySelector('#custom')?.textContent).toBe('📂');
    expect(document.querySelector('.extra-network-cards button')?.textContent).toBe('🖼️');

    const gallery = document.querySelector('#image_buttons_txt2img')!;
    gallery.innerHTML = '<button id="txt2img_send_to_img2img" title="Send to img2img">🖼️</button>';
    await Promise.resolve();
    expect(gallery.querySelector('svg')?.innerHTML).toContain(photoEdit.match(/d="([^"]+)/)?.[1]);
    expect(gallery.querySelector('button')?.textContent).toBe('');
  } finally {
    stop();
  }
});

it('decorates native and translated controls without replacing the control or its label', async () => {
  document.body.innerHTML = `
    <div id="txt2img_script_container">
      <button title="Random seed">🎲️</button>
      <button id="script_txt2img_adetailer_ad_preset_export_btn_2nd">📤 Export</button>
      <div id="script_txt2img_adetailer_ad_preview_all_tabs">
        <label><input type="checkbox"><span>🔁 Combine all tabs</span></label>
      </div>
    </div>
    <div class="extra-network-cards"><button>📂</button></div>
  `;
  vi.stubGlobal('localization', {
    '📤 Export': '📤 Экспорт',
    '🔁 Combine all tabs': '🔁 Объединить вкладки',
  });
  const stop = replaceIcons();
  try {
    const seed = document.querySelector('button')!;
    const button = document.querySelector<HTMLButtonElement>('[id$="_export_btn_2nd"]')!;
    const click = vi.fn();
    button.addEventListener('click', click);
    expect(seed.getAttribute('aria-label')).toBe('Random seed');
    expect(seed.querySelector('svg')?.getAttribute('stroke-width')).toBe('1.75');
    expect(button.textContent).toBe('Экспорт');
    expect(document.querySelector('label span')?.textContent).toBe('Объединить вкладки');
    expect(document.querySelector('.extra-network-cards svg')).toBeNull();
    button.click();
    expect(click).toHaveBeenCalledOnce();

    button.textContent = '📤 Export';
    await Promise.resolve();
    expect(button.textContent).toBe('Экспорт');
    expect(button.querySelectorAll('svg')).toHaveLength(1);
  } finally {
    stop();
  }
});
