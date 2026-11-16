import { useMemo } from 'react';

import { codeToHtml } from '@/modules/PromptHighlight/features/tokenize';
import { escapeHtml } from '@/modules/PromptHighlight/features/tokenize-core';

/**
 * Highlighted HTML for a prompt. Synchronous: the tokenizer runs in well
 * under a millisecond for a typical prompt, so there is no loading state and
 * no flash of unhighlighted text on each keystroke.
 */
export const useHighlight = (text: string, isDarkMode: boolean) => {
  const data = useMemo(() => {
    try {
      const value = text ?? '';
      if (value.length > 30_000)
        return `<pre class="shiki"><code id="lobe_highlighter">${escapeHtml(value)}</code></pre>`;
      return codeToHtml(value, isDarkMode);
    } catch {
      return `<pre class="shiki"><code id="lobe_highlighter">${escapeHtml(text ?? '')}</code></pre>`;
    }
  }, [text, isDarkMode]);
  return { data, isLoading: false };
};
