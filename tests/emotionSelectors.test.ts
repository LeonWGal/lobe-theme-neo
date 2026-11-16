import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile, serialize, stringify } from 'stylis';
import { describe, expect, it } from 'vitest';

const compileCss = (raw: string) => serialize(compile(raw), stringify);

describe('Emotion / Stylis selector hygiene', () => {
  const files = [
    'src/styles/antdOverride.ts',
    'src/styles/components/surfaces.ts',
    'src/styles/components/workspace.ts',
    'src/styles/components/collapse.ts',
    'src/styles/components/container.ts',
    'src/features/ExtraNetworkSidebar/style.ts',
  ];

  it('never glues nested :is(...) to parent selector without space', () => {
    for (const rel of files) {
      const source = readFileSync(resolve(process.cwd(), rel), 'utf8');
      // Extract template literal contents after `css\``
      const blocks = [...source.matchAll(/css`([\s\S]*?)`(?:\s*[;,)])/g)].map((m) =>
        m[1].replace(/\$\{[^}]+\}/g, '12px'),
      );
      expect(blocks.length).toBeGreaterThan(0);
      for (const block of blocks) {
        const compiled = compileCss(block);
        expect(compiled, `Glued :is( in ${rel}`).not.toMatch(
          /(?:\.lobe-settings-body|\.ant-select-dropdown|\.nocards|#lobe-neo-theme-app):is\(/,
        );
      }
    }
  });
});
