import { describe, expect, it } from 'vitest';

import { Converter } from '@/scripts/formatPrompt';

describe('prompt formatting', () => {
  it.each([
    '[cat:dog:0.5]',
    '[cat|dog]',
    '(red, blue:1.2)',
    String.raw`a \(literal\), sky`,
    'photo of a sign saying "hello, world"',
    'cat\nBREAK\ndog',
    '<lora:example:0.8>, portrait',
  ])('preserves Forge syntax in %s', (prompt) => {
    expect(Converter.convert(prompt)).toBe(prompt);
  });

  it('formats only commas outside brackets and quotes', () => {
    expect(Converter.convert('cat,dog, (red,blue:1.2)')).toBe('cat, dog, (red,blue:1.2)');
    expect(Converter.convertStr2Array('"hello, world", [cat:dog:0.5], (red, blue:1.2)')).toEqual([
      '"hello, world"',
      '[cat:dog:0.5]',
      '(red, blue:1.2)',
    ]);
  });
});
