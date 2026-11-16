import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import PromptHighlight from '@/modules/PromptHighlight';

vi.mock('@/modules/PromptHighlight/style', () => ({
  useStyles: () => ({ styles: { container: 'highlight' }, theme: { colorSuccess: 'green' } }),
}));

vi.mock('@/modules/PromptHighlight/features/SyntaxHighlighter', () => ({
  default: ({ children }: { children: string }) => <span data-testid="highlight">{children}</span>,
}));

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(400);
});
afterEach(() => {
  vi.restoreAllMocks();
});

it('keeps a long prompt visible natively and restores highlighting when it gets shorter', async () => {
  document.body.innerHTML =
    '<div id="txt2img_prompt"><textarea style="color: red">cat</textarea></div>';
  const container = document.querySelector<HTMLElement>('#txt2img_prompt')!;
  const textarea = container.querySelector('textarea')!;
  await act(async () => {
    render(<PromptHighlight parentId="#txt2img_prompt" />, {
      container: container.appendChild(document.createElement('div')),
    });
  });

  expect(screen.getByTestId('highlight').textContent).toBe('cat');
  expect(textarea.style.color).toBe('transparent');

  await act(async () => {
    fireEvent.input(textarea, { target: { value: 'tag, '.repeat(1400) } });
  });
  await waitFor(() => expect(screen.queryByTestId('highlight')).toBeNull());
  expect(textarea.style.color).toBe('red');

  await act(async () => {
    fireEvent.input(textarea, { target: { value: 'dog' } });
  });
  expect((await screen.findByTestId('highlight')).textContent).toBe('dog');
  expect(textarea.style.color).toBe('transparent');
});
