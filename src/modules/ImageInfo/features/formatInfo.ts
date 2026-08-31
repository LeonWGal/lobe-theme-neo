import { parseFromRawInfo } from '@bluelovers/auto1111-pnginfo';
import { splitSmartly } from 'split-smartly2';

const formatPrompt = (prompt: string) => {
  let newPrompt = prompt
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    // eslint-disable-next-line no-control-regex
    .replaceAll(/^[\s\u0000,。，]+$/gm, '')
    .replaceAll(/\n{2,}/g, '\n');
  const entries = splitSmartly(newPrompt.replaceAll('\n', '<br>'), [',', '，', '。'], {
    brackets: true,
    trimSeparators: true,
  }) as string[];

  return entries
    .filter((line) => line.length)
    .join(', ')
    .replaceAll('<br>', '\n')
    .replaceAll(/^\s+|\s+$/gm, '');
};

export const formatInfo = (info: string) => {
  if (!info || info === 'undefined' || !info.trim()) return;

  // Normalize HTML breaks and escaped characters to clean newlines
  const normalized = info
    .replaceAll(/<br\s*\/?>/gi, '\n')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');

  let {
    prompt: position,
    negative_prompt: negative,
    ...config
  } = parseFromRawInfo(normalized, {
    isIncludePrompts: true,
  });

  position = (position || '').trim().replaceAll(/\s+$/g, '');
  negative = (negative || '').trim().replaceAll(/\s+$/g, '');

  position = position ? formatPrompt(position) : '';
  negative = negative ? formatPrompt(negative) : '';

  return {
    config,
    negative: negative,
    positive: position,
  };
};
