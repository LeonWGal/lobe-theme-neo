import { isPromptOutputMutation } from '@/utils/promptMutations';
import { useEffect } from 'react';

/** Forge renders clickable divs; preserve its click handlers while adding keyboard access. */
export const useNetworkCardAccessibility = () => {
  useEffect(() => {
    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    const attributes = ['role', 'tabindex', 'aria-label', 'title', 'loading', 'decoding'];
    const originals = new Map<HTMLElement, (string | null)[]>();
    const selector =
      '.extra-network-cards .card[onclick], .extra-network-cards .card-button[onclick], .extra-network-cards .additional a[onclick][title], .extra-network-cards .card img, .extra-network-control > div[onclick]';
    const enhance = (container: ParentNode) => {
      const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));
      if (container instanceof HTMLElement && container.matches(selector)) elements.push(container);
      elements.forEach((element) => {
        if (originals.has(element)) return;
        originals.set(
          element,
          attributes.map((name) => element.getAttribute(name)),
        );
        if (element instanceof HTMLImageElement) {
          if (!element.hasAttribute('loading')) element.loading = 'lazy';
          if (!element.hasAttribute('decoding')) element.decoding = 'async';
          return;
        }
        if (
          element.matches('.additional a:is(.replacepreview, .openurl, .addtriggerwords, .usepreviewprompt, .renamecard, .removecard)') &&
          !element.querySelector('.lobe-helper-icon-label')
        ) {
          const text = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE);
          if (text.length) {
            const label = document.createElement('span');
            label.className = 'lobe-helper-icon-label';
            label.append(...text);
            element.append(label);
          }
        }
        element.setAttribute('role', 'button');
        element.tabIndex = 0;
        element.setAttribute(
          'aria-label',
          element.title ||
            element.dataset.name ||
            element.querySelector('.name')?.textContent ||
            '',
        );
        if (element.classList.contains('card') && !element.title)
          element.title = element.dataset.name || element.querySelector('.name')?.textContent?.trim() || '';
      });
    };
    const keydown = (event: Event) => {
      const key = event as KeyboardEvent;
      const element = key.target as HTMLElement;
      if (!originals.has(element) || !['Enter', ' '].includes(key.key)) return;
      key.preventDefault();
      key.stopPropagation();
      element.click();
    };
    let pendingRemoved = new Set<HTMLElement>();
    let pruneScheduled = false;
    const flushRemoved = () => {
      pruneScheduled = false;
      pendingRemoved.forEach((element) => {
        if (!element.isConnected) originals.delete(element);
      });
      pendingRemoved.clear();
    };
    const isNetworkHost = (node: HTMLElement) =>
      node.classList.contains('card') ||
      node.classList.contains('extra-network-cards') ||
      node.classList.contains('extra-network-control') ||
      Boolean(node.closest('.extra-network-cards, .extra-network-control')) ||
      Boolean(node.querySelector('.extra-network-cards, .extra-network-control'));
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (isPromptOutputMutation(mutation)) continue;
        const targetEl = mutation.target instanceof HTMLElement ? mutation.target : null;
        if (targetEl?.closest('[id$="_results"], [id$="_settings"]')) continue;
        for (const node of mutation.removedNodes) {
          if (!(node instanceof HTMLElement) || node.isConnected) continue;
          if (originals.has(node)) pendingRemoved.add(node);
          if (node.querySelector('.card, img, [tabindex]')) {
            node.querySelectorAll<HTMLElement>('[tabindex], img').forEach((element) => {
              if (originals.has(element)) pendingRemoved.add(element);
            });
          }
        }
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement && isNetworkHost(node)) enhance(node);
        }
      }
      if (pendingRemoved.size && !pruneScheduled) {
        pruneScheduled = true;
        queueMicrotask(flushRemoved);
      }
    });
    observer.observe(root, { childList: true, subtree: true });
    root.addEventListener('keydown', keydown);
    enhance(root);
    return () => {
      observer.disconnect();
      root.removeEventListener('keydown', keydown);
      root.querySelectorAll('.lobe-helper-icon-label').forEach((label) => label.replaceWith(...label.childNodes));
      originals.forEach((values, element) => {
        attributes.forEach((name, index) => {
          if (values[index] === null) element.removeAttribute(name);
          else element.setAttribute(name, values[index]!);
        });
      });
    };
  }, []);
};
