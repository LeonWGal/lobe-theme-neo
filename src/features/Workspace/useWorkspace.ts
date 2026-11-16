import { isPromptOutputMutation } from '@/utils/promptMutations';
import i18next from 'i18next';
import { useEffect, useRef } from 'react';

import { useAppStore } from '@/store';

import { defaultTabLayout, generationTabs, previewWidthLimits, readWorkspace, withPreviewWidth, type WorkspaceTab } from './model';
import { applyWorkspace } from './native';

export const useWorkspace = () => {
  const saved = useAppStore((state) => state.setting.workspaceLayout);
  const focusedTab = useRef<WorkspaceTab | undefined>(undefined);
  useEffect(() => {
    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    const { layout } = readWorkspace(saved);
    const handles = new Map<HTMLElement, HTMLElement>();
    const pendingWidths = new Map<WorkspaceTab, number>();
    let savingWidth = false;
    let disposed = false;
    let frame = 0;
    let setup = () => {};
    const flushWidths = async () => {
      if (savingWidth) return;
      savingWidth = true;
      try {
        while (pendingWidths.size) {
          const state = useAppStore.getState();
          let next = readWorkspace(state.setting.workspaceLayout);
          for (const [tab, width] of pendingWidths) next = withPreviewWidth(next, tab, width);
          pendingWidths.clear();
          await state.onSetSetting({ workspaceLayout: JSON.stringify(next) });
        }
      } catch {
        if (!disposed) {
          for (const handle of handles.values()) handle.remove();
          handles.clear();
          setup();
        }
      } finally {
        savingWidth = false;
      }
    };
    const { min, max } = previewWidthLimits;
    const addHandle = (row: HTMLElement, name: WorkspaceTab, initial: number) => {
      if (handles.has(row)) return;
      const handle = document.createElement('div');
      handle.className = 'lobe-workspace-divider';
      handle.tabIndex = 0;
      handle.setAttribute('role', 'separator');
      handle.setAttribute('aria-orientation', 'vertical');
      handle.setAttribute('aria-label', i18next.t('workspace.previewWidth'));
      handle.setAttribute('aria-valuemin', String(min));
      handle.setAttribute('aria-valuemax', String(max));
      handle.dataset.tab = name;
      let width = initial;
      let start = initial;
      const resize = (value: number) => {
        width = Math.max(min, Math.min(max, Math.round(value)));
        row.style.setProperty('--lobe-workspace-preview', `${width}fr`);
        row.style.setProperty('--lobe-workspace-parameters', `${100 - width}fr`);
        handle.setAttribute('aria-valuenow', String(width));
      };
      const save = () => {
        if (start === width) return;
        pendingWidths.set(name, width);
        void flushWidths();
      };
      let pointer: number | undefined;
      let dragFrame = 0;
      let dragClientX = 0;
      const left = () => row.dataset.lobeWorkspaceColumns === 'previewLeft';
      handle.onpointerdown = (event) => {
        if (event.button !== 0 || pointer !== undefined) return;
        start = width;
        pointer = event.pointerId;
        handle.setPointerCapture(pointer);
        handle.dataset.dragging = '';
        event.preventDefault();
      };
      handle.onpointermove = (event) => {
        if (pointer !== event.pointerId) return;
        dragClientX = event.clientX;
        if (dragFrame) return;
        dragFrame = requestAnimationFrame(() => {
          dragFrame = 0;
          const box = row.getBoundingClientRect();
          const ratio = (dragClientX - box.left - handle.offsetWidth / 2) / Math.max(1, box.width - handle.offsetWidth);
          resize((left() ? ratio : 1 - ratio) * 100);
        });
      };
      handle.onlostpointercapture = () => {
        if (dragFrame) {
          cancelAnimationFrame(dragFrame);
          dragFrame = 0;
        }
        if (pointer === undefined) return;
        pointer = undefined;
        delete handle.dataset.dragging;
        if (width !== start) handle.dataset.pendingWidth = '';
        save();
      };
      handle.onpointercancel = () => {
        if (dragFrame) {
          cancelAnimationFrame(dragFrame);
          dragFrame = 0;
        }
        pointer = undefined;
        delete handle.dataset.dragging;
        resize(start);
      };
      handle.onkeydown = (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        start = width;
        const direction = (event.key === 'ArrowRight' ? 1 : -1) * (left() ? 1 : -1);
        resize(event.key === 'Home' ? min : event.key === 'End' ? max : width + direction);
        if (width !== start) handle.dataset.pendingWidth = '';
        save();
      };
      resize(width);
      handles.set(row, handle);
      row.append(handle);
      if (focusedTab.current === name) {
        focusedTab.current = undefined;
        handle.focus({ preventScroll: true });
      }
    };
    setup = () => {
      frame = 0;
      for (const name of generationTabs) {
        const tab = root.querySelector<HTMLElement>(`#tab_${name}`);
        if (!tab) continue;
        const config = layout[name] ?? defaultTabLayout;
        const row = applyWorkspace(tab, name, config);
        if (row && config.placement !== 'stacked' && config.placement !== 'studio' && config.placement !== 'threeCol' && config.placement !== 'threeColPreviewLeft') {
          addHandle(row, name, config.previewWidth);
        }
      }
    };
    // These are the host nodes that can receive late native or theme tools.
    const watch = '[id$="_settings"], [id$="_toprow"], [id$="_tools"], [id$="_actions_column"], [id$="_prompt_container"], [id^="image_buttons_"], .lobe-split-action-header';
    const observer = new MutationObserver((changes) => {
      if (frame) return;
      if (changes.filter((change) => !isPromptOutputMutation(change)).some(({ addedNodes, removedNodes, target }) =>
        (target instanceof Element && target.matches(watch)) ||
        [...addedNodes, ...removedNodes].some((node) => node instanceof Element &&
          (node.matches(watch + ', #tab_txt2img, #tab_img2img') || (node.id === 'tabs' && node.querySelector(watch)))),
      )) frame = requestAnimationFrame(setup);
    });
    observer.observe(root.querySelector('#tabs') || root, { childList: true, subtree: true });
    setup();
    return () => {
      disposed = true;
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      for (const handle of handles.values()) {
        const scope = handle.getRootNode() as Document | ShadowRoot;
        if (scope.activeElement === handle) focusedTab.current = handle.dataset.tab as WorkspaceTab;
        handle.remove();
      }
    };
  }, [saved]);
};
