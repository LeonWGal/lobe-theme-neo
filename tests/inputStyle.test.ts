import { parse } from 'postcss';
import { describe, expect, it, vi } from 'vitest';

import inputStyle from '@/styles/components/input';

vi.mock('antd-style', () => ({
  css: (parts: TemplateStringsArray, ...values: unknown[]) =>
    parts.reduce((text, part, i) => text + part + (values[i] ?? ''), ''),
}));

describe('input stylesheet', () => {
  it('keeps textarea rules outside the input selector', () => {
    const css = inputStyle(new Proxy({}, { get: () => '8' }) as any) as unknown as string;
    const ast = parse(css);
    const textarea = ast.nodes.find(
      (node) => node.type === 'rule' && node.selector.startsWith('textarea'),
    );
    expect(textarea).toBeDefined();
  });
});
