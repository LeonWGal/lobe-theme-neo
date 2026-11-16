type NativeComponent = {
  id: number;
  props: { elem_id?: string; label?: string; placeholder?: string };
};

export function nativeComponents() {
  const config = window.gradio_config as { components?: NativeComponent[] } | undefined;
  return config?.components ?? [];
}

export function originalNativeLabel(element: HTMLElement, visible: string) {
  const original = nativeComponents().find(({ id, props }) =>
    (props.elem_id || `component-${id}`) === element.id ||
    (!props.elem_id && `input-accordion-${id}` === element.id))?.props.label;
  if (original) return original;
  const dictionary = (window as Window & { localization?: Record<string, unknown> }).localization;
  if (!dictionary || Object.hasOwn(dictionary, visible)) return visible;
  const matches = Object.keys(dictionary).filter((key) => dictionary[key] === visible);
  const first = matches[0];
  // Workspace keys ignore case, so capitalization variants share an identity.
  return first && matches.every((key) => key.toLowerCase() === first.toLowerCase()) ? first : visible;
}

export function markTipoFields(root: ParentNode) {
  for (const { id, props } of nativeComponents()) {
    const kind = props.placeholder?.startsWith('Tag Prompt for TIPO') ? 'tag'
      : props.placeholder?.startsWith('Natural Language Prompt for TIPO') ? 'prose' : undefined;
    if (!kind) continue;
    const elementId = props.elem_id || `component-${id}`;
    if (!/^[\w-]+$/.test(elementId)) continue;
    const host = root.querySelector<HTMLElement>(`#${elementId}`);
    const field = host instanceof HTMLTextAreaElement ? host : host?.querySelector('textarea');
    if (field && field.dataset.lobeTipoPrompt !== kind) {
      field.dataset.lobeTipoPrompt = kind;
      (window as Window & { lobeTagComplete?: { addArea?: (area: HTMLTextAreaElement) => void } })
        .lobeTagComplete?.addArea?.(field);
    }
  }
}
