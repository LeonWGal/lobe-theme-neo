import { renderHook } from '@testing-library/react';
import { expect,it } from 'vitest';
import { useHighlight } from '@/hooks/useHighlight';

it('shows the current highlighted prompt immediately without waiting for a WASM loading state',()=>{
  const hook=renderHook(({text})=>useHighlight(text,false),{initialProps:{text:'cat'}});
  hook.rerender({text:'cat, dog, (bird:1.2)'});
  const host=document.createElement('div');host.innerHTML=hook.result.current.data;
  expect(host.textContent).toBe('cat, dog, (bird:1.2)');expect(hook.result.current.isLoading).toBe(false);hook.unmount();
});
it('renders markup as text even for prompts above the grammar budget',()=>{
  const text='<img src=x onerror=alert(1)>'.repeat(1500);
  const hook=renderHook(()=>useHighlight(text,true));
  const host=document.createElement('div');host.innerHTML=hook.result.current.data;
  expect(host.querySelector('img')).toBeNull();expect(host.textContent).toBe(text);hook.unmount();
});
