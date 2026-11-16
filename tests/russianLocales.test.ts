import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { originalNativeLabel } from '@/utils/nativeLocale';

import en from '../locales/en_US.json';
import ru from '../locales/ru_RU.json';
const nativePath = resolve('../sd-webui-language-diffusion/localizations/ru_RU.json');

type Dictionary = { [key: string]: string | Dictionary };

function flatten(values: Dictionary, prefix = ''): [string, string][] {
  return Object.entries(values).flatMap(([key, value]) => {
    const path = prefix + key;
    return typeof value === 'string' ? [[path, value]] : flatten(value, path + '.');
  });
}

const placeholders = (text: string) =>
  Array.from(text.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g), ([, name]) => name).sort();

describe('Russian localization', () => {
  it('matches English keys and preserves interpolation placeholders', () => {
    const english = Object.fromEntries(flatten(en));
    const russian = Object.fromEntries(flatten(ru));
    expect(Object.keys(russian).sort()).toEqual(Object.keys(english).sort());
    for (const [key, text] of Object.entries(english)) {
      expect(placeholders(russian[key]), key).toEqual(placeholders(text));
    }
  });

  it('reserves подсказки for autocomplete', () => {
    for (const [key, text] of flatten(ru)) {
      if (!key.startsWith('autocomplete.')) expect(text, key).not.toMatch(/подсказк/iu);
    }
  });

  it('leaves the native Russian dictionary to Language Diffusion', () => {
    expect(existsSync(resolve('localizations/ru_RU.json'))).toBe(false);
  });

  it.skipIf(!existsSync(nativePath))('uses the same labels in theme actions and Forge controls', () => {
    const forge = JSON.parse(readFileSync(nativePath, 'utf8')) as Record<string, string>;
    expect(ru.sidebar.extraNetwork).toBe(forge['Extra Networks']);
    expect(ru.tools.palette.generate).toBe(forge.Generate);
    expect(ru.tools.palette.interrupt).toBe(forge.Interrupt);
    expect(ru.tools.palette.groups.checkpoint).toBe(forge.Checkpoints);
    expect(ru.workspace.items.queue).toBe(forge.Enqueue);
    expect(ru.aspectPanel.frames).toBe(forge.Frames);
    expect(ru.aspectPanel.batchSize).toBe(forge['Batch Size']);
  });

  it('recovers case variants without guessing between different native labels', () => {
    vi.stubGlobal('localization', {
      'Sampling method': 'Метод сэмплирования',
      'Sampling Method': 'Метод сэмплирования',
      'Extension A': 'Расширение',
      'Extension B': 'Расширение',
    });
    try {
      const element = document.createElement('div');
      expect(originalNativeLabel(element, 'Метод сэмплирования').toLowerCase()).toBe('sampling method');
      expect(originalNativeLabel(element, 'Расширение')).toBe('Расширение');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
