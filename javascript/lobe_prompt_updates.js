/* Forge dispatches DOM changes to every extension registered with onUiUpdate. */
(() => {
  const outputs = '[data-code-type="highlighter"], .autocompleteParent, .acRuby, .lobe-caret-mirror';
  const isOutput = (record) => {
    const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
    return Boolean(target?.closest(outputs));
  };
  const install = () => {
    if (typeof executeCallbacks !== 'function' || typeof uiUpdateCallbacks === 'undefined' ||
        typeof scheduleAfterUiUpdateCallbacks !== 'function' || executeCallbacks.lobePromptFiltered) return;
    const execute = executeCallbacks;
    const schedule = scheduleAfterUiUpdateCallbacks;
    let promptOnly = false;
    executeCallbacks = function (queue, records) {
      if (queue === uiUpdateCallbacks && Array.isArray(records) && records.length) {
        const relevant = records.filter((record) => !isOutput(record));
        promptOnly = relevant.length === 0;
        if (promptOnly) return;
        return execute.call(this, queue, relevant.length === records.length ? records : relevant);
      }
      return execute.apply(this, arguments);
    };
    executeCallbacks.lobePromptFiltered = true;
    scheduleAfterUiUpdateCallbacks = function () {
      const skip = promptOnly;
      promptOnly = false;
      if (!skip) return schedule.apply(this, arguments);
    };
  };
  install();
  document.addEventListener('DOMContentLoaded', install, { capture: true, once: true });
})();
