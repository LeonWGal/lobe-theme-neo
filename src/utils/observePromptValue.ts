const observations = new WeakMap<
  HTMLTextAreaElement,
  { dispose: () => void; listeners: Set<() => void> }
>();
/** Observe Gradio and extension assignments as well as ordinary keyboard input. */
export function observePromptValue(area: HTMLTextAreaElement, listener: () => void) {
  let state = observations.get(area);
  if (!state) {
    const previous = Object.getOwnPropertyDescriptor(area, 'value');
    const native =
      previous?.get && previous?.set
        ? previous
        : Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!;
    const listeners = new Set<() => void>();
    const notify = () => {
      for (const fn of listeners) fn();
    };
    const setter = function (this: HTMLTextAreaElement, value: string) {
      native.set!.call(this, value);
      notify();
    };
    Object.defineProperty(area, 'value', {
      configurable: true,
      get() {
        return native.get!.call(this);
      },
      set: setter,
    });
    area.addEventListener('input', notify);
    area.addEventListener('lobe:prompt-input', notify);
    area.addEventListener('change', notify);
    state = {
      dispose() {
        area.removeEventListener('input', notify);
        area.removeEventListener('lobe:prompt-input', notify);
        area.removeEventListener('change', notify);
        if (Object.getOwnPropertyDescriptor(area, 'value')?.set === setter) {
          if (previous) Object.defineProperty(area, 'value', previous);
          else delete (area as any).value;
        }
      },
      listeners,
    };
    observations.set(area, state);
  }
  state.listeners.add(listener);
  return () => {
    state!.listeners.delete(listener);
    if (!state!.listeners.size) {
      state!.dispose();
      observations.delete(area);
    }
  };
}
