import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDropdownMenus } from '@/hooks/useDropdownMenus';

describe('native Gradio dropdown integration', () => {
  it('positions native menus and restores their styles on unmount', () => {
    document.body.innerHTML =
      '<div class="gradio-dropdown"><div class="wrap hide"></div><div class="wrap"><div class="wrap-inner"><input role="listbox"></div><ul class="options" role="listbox"><li>Model</li></ul></div></div><div role="listbox" id="foreign"></div>';
    const wrap = document.querySelector('.wrap-inner')!.parentElement!;
    vi.spyOn(wrap, 'getBoundingClientRect').mockReturnValue({
      bottom: 140,
      left: 30,
      top: 100,
      width: 280,
    } as DOMRect);
    const menu = document.querySelector<HTMLUListElement>('ul.options')!;
    menu.style.setProperty('--lobe-menu-left', 'old', 'important');
    const previousPriority = menu.style.getPropertyPriority('--lobe-menu-left');
    const hook = renderHook(useDropdownMenus);
    expect(menu.dataset.lobeMenu).toBe('true');
    expect(document.querySelector('input')?.hasAttribute('data-lobe-menu')).toBe(false);
    expect(menu.style.getPropertyValue('--lobe-menu-width')).toBe('280px');
    expect(menu.style.getPropertyValue('--lobe-menu-top')).toBe('144px');
    expect(document.querySelector('#foreign')?.hasAttribute('data-lobe-menu')).toBe(false);
    hook.unmount();
    expect(menu.dataset.lobeMenu).toBeUndefined();
    expect(menu.style.getPropertyValue('--lobe-menu-left')).toBe('old');
    expect(menu.style.getPropertyPriority('--lobe-menu-left')).toBe(previousPriority);
    expect(menu.style.getPropertyValue('--lobe-menu-width')).toBe('');
  });
});
