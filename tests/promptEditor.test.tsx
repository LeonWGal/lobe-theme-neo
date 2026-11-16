import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Prompt from '@/components/PromptEditor/Prompt';
import { useAppStore } from '@/store';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/components/PromptEditor/style', () => ({
  useStyles: () => ({ styles: { promptView: '' } }),
}));
vi.mock('@/components/PromptEditor/TagList', () => ({
  default: ({ tags, setValue }: any) => (
    <button onClick={() => setValue([...tags, { id: 'new', text: 'new' }])}>Add tag</button>
  ),
}));

describe('prompt editor', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="txt2img_prompt"><textarea>existing, (weighted:1.3)</textarea></div>' +
      '<div id="img2img_prompt"><textarea>image prompt</textarea></div>';
    useAppStore.setState({ currentTab: 'tab_txt2img' });
  });
  it('retains the existing prompt when adding the first tag', () => {
    render(<Prompt type="positive" />);
    fireEvent.click(screen.getByText('Add tag'));
    expect(document.querySelector('textarea')?.value).toBe('existing, (weighted:1.3), new');
  });
  it('reads external edits before the next tag operation', () => {
    render(<Prompt type="positive" />);
    const textarea = document.querySelector('textarea')!;
    fireEvent.input(textarea, { target: { value: '[cat:dog:0.5]' } });
    fireEvent.click(screen.getByText('Add tag'));
    expect(textarea.value).toBe('[cat:dog:0.5], new');
  });
  it('switches to the active tab without writing into the other prompt', () => {
    render(<Prompt type="positive" />);
    act(() => useAppStore.setState({ currentTab: 'tab_img2img' }));
    fireEvent.click(screen.getByText('Add tag'));
    expect(document.querySelector<HTMLTextAreaElement>('#img2img_prompt textarea')?.value).toBe(
      'image prompt, new',
    );
    expect(document.querySelector<HTMLTextAreaElement>('#txt2img_prompt textarea')?.value).toBe(
      'existing, (weighted:1.3)',
    );
  });
});
