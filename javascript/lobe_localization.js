/* Keep Forge's translator away from text owned by the theme. */
(() => {
  const owned = '[data-lobe-localized], .autocompleteParent, #lobe-autocomplete-popover, .sd-ar-panel-compact, .sd-ar-popover, .sd-ar-sampling-title';
  const native = '[data-lobe-native-content]';
  const isOwned = (node) => {
    const element = node.nodeType === 1 ? node : node.parentElement;
    return Boolean(element?.closest(owned + ', ' + native)?.matches(owned));
  };
  const install = () => {
    if (!Object.keys(window.localization || {}).length ||
        typeof processNode !== 'function' || typeof canBeTranslated !== 'function' ||
        typeof textNodesUnder !== 'function' || processNode.lobeAware) return;
    const originalProcess = processNode;
    const originalCanTranslate = canBeTranslated;
    processNode = function (node) {
      if (!isOwned(node)) return originalProcess.call(this, node);
    };
    processNode.lobeAware = true;
    canBeTranslated = function (node, text) {
      return !isOwned(node) && originalCanTranslate.call(this, node, text);
    };
    textNodesUnder = function (node) {
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode(child) {
          if (child.nodeType === 1) {
            if (child.matches(owned) && !child.querySelector(native)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_SKIP;
          }
          return isOwned(child) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        },
      });
      const text = [];
      while (walker.nextNode()) text.push(walker.currentNode);
      return text;
    };
  };
  install();
  document.addEventListener('DOMContentLoaded', install, { capture: true, once: true });
})();
