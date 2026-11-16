const promptOutput = '[data-code-type="highlighter"], .autocompleteParent, #lobe-autocomplete-popover, .acRuby, .lobe-caret-mirror';

// These render their own contents and do not add native Forge controls.
export const isPromptOutputMutation = ({ target }: MutationRecord) =>
  Boolean((target instanceof Element ? target : target.parentElement)?.closest(promptOutput));
