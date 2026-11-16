import { type EffectiveWorkbenchLayout } from '@/features/Workspace/model';
import { isPromptOutputMutation } from '@/utils/promptMutations';
import { memo, useEffect } from 'react';

type Mode = 'off' | 'split' | 'stacked' | 'stackedSplit' | 'threeCol' | 'threeColPreviewLeft' | 'studio';

const SplitView = memo(({
  extras: extrasEnabled = true,
  img2img = 'split',
  txt2img = 'split',
  workbenchImg2img = 'stage',
  workbenchTxt2img = 'stage',
}: {
  extras?: boolean;
  img2img?: Mode;
  txt2img?: Mode;
  workbenchImg2img?: EffectiveWorkbenchLayout;
  workbenchTxt2img?: EffectiveWorkbenchLayout;
}) => {
  useEffect(() => {
    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    const moved = new Map<HTMLElement, Comment>();
    const headers = new Set<HTMLElement>();
    const promptRows = new Set<HTMLElement>();
    const marked = new Set<HTMLElement>();
    const promptHosts = new Set<HTMLElement>();
    const move = (element: HTMLElement | null, parent: HTMLElement, first = false) => {
      if (
        !element ||
        (element.parentElement === parent && (!first || parent.firstElementChild === element))
      )
        return;
      if (!moved.has(element)) {
        const anchor = document.createComment('lobe-split-original-position');
        element.before(anchor);
        moved.set(element, anchor);
      }
      if (first) parent.prepend(element);
      else parent.append(element);
    };
    const headerFor = (preview: HTMLElement, sticky = false) => {
      let header = preview.querySelector<HTMLElement>(':scope > .lobe-split-action-header');
      if (!header) {
        header = document.createElement('div');
        header.className = sticky
          ? 'lobe-split-action-header lobe-sticky-generation'
          : 'lobe-split-action-header';
        preview.prepend(header);
        headers.add(header);
      }
      return header;
    };
    const setup = () => {
      for (const [tab, mode, wbLayout] of [
        ['txt2img', txt2img, workbenchTxt2img],
        ['img2img', img2img, workbenchImg2img],
      ] as const) {
        let top = root.querySelector<HTMLElement>(`#${tab}_toprow`);
        const generate = root.querySelector<HTMLElement>(`#${tab}_generate_box`);
        const enqueue = root.querySelector<HTMLElement>(`#${tab}_enqueue_wrapper`);
        const prompt = root.querySelector<HTMLElement>(`#${tab}_prompt_container`);
        if (!top && generate?.isConnected && prompt?.isConnected) {
          top = document.createElement('div');
          top.id = `${tab}_toprow`;
          const actions = document.createElement('div');
          actions.id = `${tab}_actions_column`;
          actions.className = 'gradio-column lobe-inline-prompt-actions';
          prompt.before(top);
          top.append(actions);
          move(prompt, top, true);
          promptRows.add(top);
        }
        const actions = top?.querySelector<HTMLElement>(`#${tab}_actions_column`);
        if (actions) {
          if (generate && generate.parentElement !== actions) move(generate, actions, true);
          if (enqueue && enqueue.parentElement !== actions) move(enqueue, actions);
        }
        const settings = root.querySelector<HTMLElement>(`#${tab}_settings`);
        const preview = root.querySelector<HTMLElement>(`#${tab}_gallery_container`);
        const tabNode = settings?.closest<HTMLElement>(`#tab_${tab}`) ?? root.querySelector<HTMLElement>(`#tab_${tab}`);
        if (tabNode) {
          tabNode.dataset.lobeWorkbenchLayout = wbLayout;
          marked.add(tabNode);
        }
        if (mode === 'off') {
          if (wbLayout === 'docked' && top && settings) {
            const host = top.parentElement;
            if (host && host !== settings && host !== tabNode && host !== root.querySelector('#tabs')) {
              host.dataset.lobePromptHost = 'true';
              promptHosts.add(host);
            }
            move(top, settings, true);
          }
          continue;
        }
        if (!settings || !preview) continue;
        if (tabNode) {
          tabNode.dataset.lobePreviewMode = mode === 'threeCol' || mode === 'threeColPreviewLeft' ? 'split' : mode;
        }
        // The native action column sits beside the prompt at the top in side-by-side layouts unless workbench is docked.
        if (mode === 'split' && wbLayout !== 'docked') continue;
        const host = top?.parentElement;
        const main = settings.parentElement;
        if ((mode === 'threeCol' || mode === 'threeColPreviewLeft' || mode === 'studio') && main) {
          if (host && host !== main && host !== settings && host !== tabNode && host !== root.querySelector('#tabs')) {
            host.dataset.lobePromptHost = 'true';
            promptHosts.add(host);
          }
          move(top, main, false);
        } else {
          if (host && host !== settings && host !== tabNode && host !== root.querySelector('#tabs')) {
            host.dataset.lobePromptHost = 'true';
            promptHosts.add(host);
          }
          move(top, settings, true);
        }
        if (generate && !actions) {
          const row = settings.parentElement;
          const results = preview.closest(`#${tab}_results`);
          const stickyRow = row && row.classList.contains('gradio-row') && results?.parentElement === row ? row : null;
          const header = headerFor(stickyRow || preview, Boolean(stickyRow));
          move(generate, header);
          move(enqueue, header);
        }
      }
      const extras = root.querySelector<HTMLElement>('#extras_results');
      const generate =
        root.querySelector<HTMLElement>('#extras_generate_box') ||
        root.querySelector<HTMLElement>('#extras_generate');
      if (extrasEnabled && extras && generate) {
        move(generate, headerFor(extras));
      }
    };
    const layoutSelector = ['txt2img', 'img2img']
      .flatMap((tab) =>
        ['settings', 'gallery_container', 'generate_box', 'enqueue_wrapper', 'toprow', 'prompt_container'].map(
          (part) => `#${tab}_${part}`,
        ),
      )
      .concat(['#extras_results', '#extras_generate_box', '#extras_generate'])
      .join(',');
    let frame = 0;
    const observer = new MutationObserver((mutations) => {
      if (frame) return;
      const changedLayout = mutations.some((mutation) => !isPromptOutputMutation(mutation) &&
        [...mutation.addedNodes, ...mutation.removedNodes].some(
          (node) =>
            node instanceof Element &&
            (node.matches(layoutSelector) || node.querySelector(layoutSelector)),
        ),
      );
      if (changedLayout)
        frame = requestAnimationFrame(() => {
          frame = 0;
          setup();
        });
    });
    observer.observe(root.querySelector('#tabs') || root, { childList: true, subtree: true });
    setup();
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      [...moved.entries()].reverse().forEach(([element, anchor]) => {
        if (anchor.parentNode) anchor.parentNode.insertBefore(element, anchor);
        anchor.remove();
      });
      headers.forEach((header) => header.remove());
      promptRows.forEach((row) => row.remove());
      marked.forEach((tab) => {
        delete tab.dataset.lobePreviewMode;
        delete tab.dataset.lobeWorkbenchLayout;
      });
      promptHosts.forEach((host) => delete host.dataset.lobePromptHost);
    };
  }, [extrasEnabled, img2img, txt2img, workbenchImg2img, workbenchTxt2img]);
  return null;
});

export default SplitView;
