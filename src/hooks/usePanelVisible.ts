import { useEffect, useState } from 'react';

/** Native floating panels update these attributes without re-rendering the application. */
export function usePanelVisible(kind: 'quick' | 'extra') {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const selector = `.lobe-sidebar-${kind === 'quick' ? 'left' : 'right'} .lobe-sidebar-content`;
    let discovery: MutationObserver;
    let content: HTMLElement | null = null;
    function sync() {
      setVisible(
        Boolean(content && content.getAttribute('aria-hidden') !== 'true' && !content.inert),
      );
    }
    const observer = new MutationObserver(sync);
    function attach() {
      const next = document.querySelector<HTMLElement>(selector);
      if (!next) return;
      content = next;
      discovery.disconnect();
      observer.observe(content, { attributeFilter: ['aria-hidden', 'inert'], attributes: true });
      sync();
    }
    discovery = new MutationObserver(attach);
    discovery.observe(document.body, { childList: true, subtree: true });
    attach();
    return () => {
      discovery.disconnect();
      observer.disconnect();
    };
  }, [kind]);
  return visible;
}
