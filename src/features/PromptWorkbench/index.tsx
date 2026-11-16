import {
  ChevronDown,
  ChevronRight,
  Dices,
  Palette,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Wand2,
} from 'lucide-react';
import { Suspense, lazy, memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { readWorkspace, resolveWorkbenchLayout } from '@/features/Workspace/model';
import { useAppStore } from '@/store';
import { isPromptOutputMutation } from '@/utils/promptMutations';

import { useStyles } from './style';

const PromptPicker = lazy(() => import('@/components/PromptEditor/PromptPicker'));

type GenTab = 'txt2img' | 'img2img';
type PanelKey = 'styles' | 'dynamic' | 'picker' | 'tipo' | 'gacha';

interface WorkbenchState {
  open: Record<PanelKey, boolean>;
}

const DEFAULT_STATE: WorkbenchState = {
  open: {
    dynamic: false,
    gacha: false,
    picker: false,
    styles: false,
    tipo: false,
  },
};

const STORAGE_PREFIX = 'lobe-prompt-workbench:';

function readState(tab: GenTab): WorkbenchState {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${tab}`);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      open: {
        ...DEFAULT_STATE.open,
        ...parsed?.open,
      },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(tab: GenTab, state: WorkbenchState) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${tab}`, JSON.stringify(state));
  } catch {
    /* ignore storage errors */
  }
}

function ensureHiddenStyle() {
  const id = 'lobe-prompt-workbench-style';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    [data-lobe-workbench-hidden='true'] { display: none !important; }
    [data-lobe-workbench-active='true'] { gap: 6px !important; }
    [data-lobe-workbench-active='true'] > .gradio-row,
    [data-lobe-workbench-active='true'] > [id$='_prompt_row'],
    [data-lobe-workbench-active='true'] > [id$='_neg_prompt_row'] {
      margin: 0 !important;
      gap: 6px !important;
    }
    [data-lobe-workbench-active='true'] > [id$='_prompt_row'] > .form,
    [data-lobe-workbench-active='true'] > [id$='_neg_prompt_row'] > .form {
      margin: 0 !important;
    }
    [data-lobe-workbench-active='true'] textarea[data-lobe-tipo-prompt],
    [data-lobe-workbench-active='true'] textarea[placeholder*="for TIPO"] {
      min-height: 42px !important;
      rows: 2;
    }
    [data-lobe-workbench-active='true'] .gradio-textbox {
      margin: 0 !important;
    }
    [data-lobe-workbench-active='true'] .lobe-workbench-bottom {
      margin-top: 2px !important;
    }
  `;
  document.head.append(style);
}

function findTipoPromptElements(container: HTMLElement): HTMLElement[] {
  const found = new Set<HTMLElement>();
  const textareas = container.querySelectorAll<HTMLTextAreaElement>(
    'textarea[data-lobe-tipo-prompt], textarea[placeholder*="for TIPO"]',
  );
  for (const ta of textareas) {
    let node: HTMLElement | null = ta;
    while (node && node.parentElement !== container) {
      node = node.parentElement;
    }
    if (node && node.parentElement === container) {
      found.add(node);
    }
  }
  for (const child of Array.from(container.children) as HTMLElement[]) {
    if (
      child.classList.contains('lobe-workbench-top') ||
      child.classList.contains('lobe-workbench-bottom') ||
      /_(prompt_row|neg_prompt_row|tools)$/.test(child.id)
    ) {
      continue;
    }
    const btn = child.querySelector('button');
    if (
      btn &&
      child.querySelectorAll('textarea').length === 0 &&
      /^(generate prompt|создать промпт)$/i.test(btn.textContent?.trim() ?? '')
    ) {
      found.add(child);
    }
  }
  return [...found];
}

interface Availability {
  dynamic: boolean;
  dynamicEnabled: boolean;
  gacha: boolean;
  gachaEnabled: boolean;
  styles: boolean;
  tipo: boolean;
  tipoEnabled: boolean;
  tipoPrompt: boolean;
}

const TabWorkbench = memo<{ tab: GenTab }>(({ tab }) => {
  const { cx, styles } = useStyles();
  const { t } = useTranslation();
  const hideTipoPrompt = useAppStore((s) => s.setting.hideTipoPrompt);
  const workspaceLayoutSetting = useAppStore((s) => s.setting.workspaceLayout);
  const layoutSplitPreview = useAppStore((s) => s.setting.layoutSplitPreview);
  const studioHideSettingsByDefault = useAppStore((s) => s.setting.studioHideSettingsByDefault);
  const onSetSetting = useAppStore((s) => s.onSetSetting);
  const { layout } = readWorkspace(workspaceLayoutSetting);
  const placement = layout[tab]?.placement;
  const isStudioMode = placement === 'studio';
  const splitActive =
    placement === 'threeCol' || placement === 'threeColPreviewLeft'
      ? true
      : placement === 'studio'
        ? false
        : (layout[tab]?.splitPreview ?? layoutSplitPreview);
  const wbLayout = resolveWorkbenchLayout(splitActive);
  const [studioParamsOpen, setStudioParamsOpen] = useState<boolean>(() => !studioHideSettingsByDefault);
  useEffect(() => {
    setStudioParamsOpen(!studioHideSettingsByDefault);
  }, [studioHideSettingsByDefault, isStudioMode]);
  const [state, setState] = useState<WorkbenchState>(() => readState(tab));
  const [hosts, setHosts] = useState<{ bottom: HTMLDivElement; stage: HTMLDivElement; top: HTMLDivElement } | null>(null);
  const [avail, setAvail] = useState<Availability>({
    dynamic: false,
    dynamicEnabled: false,
    gacha: false,
    gachaEnabled: false,
    styles: false,
    tipo: false,
    tipoEnabled: false,
    tipoPrompt: false,
  });

  const toolsSlotRef = useRef<HTMLDivElement>(null);
  const stylesSlotRef = useRef<HTMLDivElement>(null);
  const dynamicSlotRef = useRef<HTMLDivElement>(null);
  const tipoSlotRef = useRef<HTMLDivElement>(null);
  const gachaSlotRef = useRef<HTMLDivElement>(null);

  const movedRef = useRef(new Map<HTMLElement, Comment>());
  const hostsRef = useRef<{ bottom: HTMLDivElement; stage: HTMLDivElement; top: HTMLDivElement } | null>(null);
  const wbLayoutRef = useRef(wbLayout);
  wbLayoutRef.current = wbLayout;

  const updateState = useCallback(
    (updater: (prev: WorkbenchState) => WorkbenchState) => {
      setState((prev) => {
        const next = updater(prev);
        writeState(tab, next);
        return next;
      });
    },
    [tab],
  );

  const togglePanel = useCallback(
    (key: PanelKey) => {
      updateState((prev) => {
        const nextOpen = !prev.open[key];
        return {
          ...prev,
          open: {
            dynamic: false,
            gacha: false,
            [key]: nextOpen,
            picker: false,
            styles: false,
            tipo: false,
          },
        };
      });
    },
    [updateState],
  );

  const moveNode = useCallback((el: HTMLElement | null, target: HTMLElement | null) => {
    if (!el || !target || el.parentElement === target) return;
    if (!movedRef.current.has(el)) {
      const anchor = document.createComment(`lobe-workbench-${tab}-origin`);
      el.before(anchor);
      movedRef.current.set(el, anchor);
    }
    target.append(el);
  }, [tab]);

  // Mount top/bottom hosts into #${tab}_prompt_container and keep native nodes synced
  useEffect(() => {
    ensureHiddenStyle();
    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    let frame = 0;

    const sync = () => {
      frame = 0;
      const container = root.querySelector<HTMLElement>(`#${tab}_prompt_container`);
      const tabRoot = root.querySelector<HTMLElement>(`#tab_${tab}`) || root;
      if (!container) return;
      container.dataset.lobeWorkbenchActive = 'true';

      if (!hostsRef.current) {
        const top = document.createElement('div');
        top.className = 'lobe-workbench-top';
        const bottom = document.createElement('div');
        bottom.className = 'lobe-workbench-bottom';
        const stage = document.createElement('div');
        stage.className = 'lobe-workbench-stage';
        hostsRef.current = { bottom, stage, top };
        setHosts({ bottom, stage, top });
      }

      const { top, bottom, stage } = hostsRef.current;
      if (top.parentElement !== container || container.firstElementChild !== top) {
        container.prepend(top);
      }
      if (bottom.parentElement !== container || container.lastElementChild !== bottom) {
        container.append(bottom);
      }
      const topRow = root.querySelector<HTMLElement>(`#${tab}_toprow`);
      const stageTarget = wbLayoutRef.current === 'stage' && topRow ? topRow : bottom;
      if (stage.parentElement !== stageTarget) {
        stageTarget.append(stage);
      }

      const tools = root.querySelector<HTMLElement>(`#${tab}_tools`);
      const stylesRow = root.querySelector<HTMLElement>(`#${tab}_styles_row`);
      const dynamicEl = tabRoot.querySelector<HTMLElement>('#sddp-dynamic-prompting');
      const tipoEl = tabRoot.querySelector<HTMLElement>(`#${tab}_tipo_accordion`);
      const gachaEl = tabRoot.querySelector<HTMLElement>('.booru-gacha-container');

      moveNode(tools, toolsSlotRef.current);
      moveNode(stylesRow, stylesSlotRef.current);
      moveNode(dynamicEl, dynamicSlotRef.current);
      moveNode(tipoEl, tipoSlotRef.current);
      moveNode(gachaEl, gachaSlotRef.current);

      const dynamicCheckbox = dynamicEl?.querySelector<HTMLInputElement>(
        '#sddp-dynamic-prompts-enabled input[type="checkbox"]',
      );
      const tipoCheckbox = tipoEl?.querySelector<HTMLInputElement>(
        `#${tab}_tipo_enabled input[type="checkbox"], .label-wrap input[type="checkbox"], summary input[type="checkbox"]`,
      );
      const gachaCheckbox = gachaEl?.querySelector<HTMLInputElement>(
        '.gacha-autogacha-controls-row input[type="checkbox"]',
      );

      const tipoPromptEls = findTipoPromptElements(container);
      setAvail({
        dynamic: Boolean(dynamicEl),
        dynamicEnabled: Boolean(dynamicCheckbox?.checked),
        gacha: Boolean(gachaEl),
        gachaEnabled: Boolean(gachaCheckbox?.checked),
        styles: Boolean(stylesRow),
        tipo: Boolean(tipoEl),
        tipoEnabled: Boolean(tipoCheckbox?.checked),
        tipoPrompt: tipoPromptEls.length > 0,
      });
    };

    const observer = new MutationObserver((mutations) => {
      if (frame) return;
      const relevant = mutations.some(
        (m) =>
          !isPromptOutputMutation(m) &&
          (m.addedNodes.length > 0 || m.removedNodes.length > 0),
      );
      if (relevant) frame = requestAnimationFrame(sync);
    });

    const observeTarget = root.querySelector(`#tab_${tab}`) || root;
    observer.observe(observeTarget, { childList: true, subtree: true });
    sync();

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      const fallbackHost =
        root.querySelector<HTMLElement>(`#${tab}_settings`) ||
        root.querySelector<HTMLElement>(`#${tab}_prompt_container`);
      for (const [el, anchor] of movedRef.current) {
        if (anchor.isConnected) {
          anchor.before(el);
          anchor.remove();
        } else if (fallbackHost && el.isConnected) {
          fallbackHost.append(el);
        }
      }
      movedRef.current.clear();
      hostsRef.current?.top.remove();
      hostsRef.current?.bottom.remove();
      hostsRef.current?.stage.remove();
      hostsRef.current = null;
      const container = root.querySelector<HTMLElement>(`#${tab}_prompt_container`);
      if (container) {
        delete container.dataset.lobeWorkbenchActive;
      }
      const topRow = root.querySelector<HTMLElement>(`#${tab}_toprow`);
      if (topRow) delete topRow.dataset.lobeStageOpen;
    };
  }, [moveNode, tab]);

  // Move stage host cleanly between #${tab}_toprow (Variant A) and bottom (Variant B)
  useEffect(() => {
    if (!hosts) return;
    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    const topRow = root.querySelector<HTMLElement>(`#${tab}_toprow`);
    const stageTarget = wbLayout === 'stage' && topRow ? topRow : hosts.bottom;
    if (hosts.stage.parentElement !== stageTarget) {
      stageTarget.append(hosts.stage);
    }
  }, [hosts, tab, wbLayout]);

  // Re-attach moved nodes when refs become ready after portal render
  useEffect(() => {
    if (!hosts) return;
    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    const tabRoot = root.querySelector<HTMLElement>(`#tab_${tab}`) || root;
    moveNode(root.querySelector<HTMLElement>(`#${tab}_tools`), toolsSlotRef.current);
    moveNode(root.querySelector<HTMLElement>(`#${tab}_styles_row`), stylesSlotRef.current);
    moveNode(tabRoot.querySelector<HTMLElement>('#sddp-dynamic-prompting'), dynamicSlotRef.current);
    moveNode(tabRoot.querySelector<HTMLElement>(`#${tab}_tipo_accordion`), tipoSlotRef.current);
    moveNode(tabRoot.querySelector<HTMLElement>('.booru-gacha-container'), gachaSlotRef.current);
  }, [hosts, moveNode, tab]);

  // Toggle visibility of TIPO prompt boxes and Generate Prompt button
  useEffect(() => {
    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    const container = root.querySelector<HTMLElement>(`#${tab}_prompt_container`);
    if (!container) return;
    const elements = findTipoPromptElements(container);
    for (const el of elements) {
      if (hideTipoPrompt) el.dataset.lobeWorkbenchHidden = 'true';
      else delete el.dataset.lobeWorkbenchHidden;
    }
    return () => {
      for (const el of elements) {
        delete el.dataset.lobeWorkbenchHidden;
      }
    };
  }, [hideTipoPrompt, hosts, avail.tipoPrompt, tab]);

  // Auto-open Gradio's inner accordion when Dynamic Prompts / TIPO / Booru Tags Lite pill is opened
  useEffect(() => {
    const slots: Array<[boolean, HTMLDivElement | null, string]> = [
      [state.open.dynamic, dynamicSlotRef.current, '#sddp-dynamic-prompting .label-wrap, #sddp-dynamic-prompting summary'],
      [state.open.tipo, tipoSlotRef.current, '.label-wrap, summary'],
      [state.open.gacha, gachaSlotRef.current, '.label-wrap, summary'],
    ];
    for (const [isOpen, slot, selector] of slots) {
      if (!isOpen || !slot) continue;
      const wrap = slot.querySelector<HTMLElement>(selector);
      if (!wrap) continue;
      const details = wrap.closest('details');
      if (details) {
        if (!details.open) details.open = true;
      } else if (!wrap.classList.contains('open')) {
        wrap.click();
      }
    }
  }, [state.open.dynamic, state.open.gacha, state.open.tipo]);

  // Listen to Dynamic Prompts, TIPO, and Booru Tags Lite enabled checkbox changes
  useEffect(() => {
    const dynSlot = dynamicSlotRef.current;
    const tipoSlot = tipoSlotRef.current;
    const gachaSlot = gachaSlotRef.current;
    const onDynamicChange = (e: Event) => {
      const target = e.target;
      if (
        target instanceof HTMLInputElement &&
        target.type === 'checkbox' &&
        target.closest('#sddp-dynamic-prompts-enabled')
      ) {
        setAvail((prev) => ({ ...prev, dynamicEnabled: target.checked }));
      }
    };
    const onTipoChange = (e: Event) => {
      const target = e.target;
      if (
        target instanceof HTMLInputElement &&
        target.type === 'checkbox' &&
        (target.closest(`#${tab}_tipo_enabled`) || target.closest('.label-wrap') || target.closest('summary'))
      ) {
        setAvail((prev) => ({ ...prev, tipoEnabled: target.checked }));
      }
    };
    const onGachaChange = (e: Event) => {
      const target = e.target;
      if (
        target instanceof HTMLInputElement &&
        target.type === 'checkbox' &&
        target.closest('.gacha-autogacha-controls-row')
      ) {
        setAvail((prev) => ({ ...prev, gachaEnabled: target.checked }));
      }
    };
    dynSlot?.addEventListener('change', onDynamicChange);
    tipoSlot?.addEventListener('change', onTipoChange);
    gachaSlot?.addEventListener('change', onGachaChange);
    return () => {
      dynSlot?.removeEventListener('change', onDynamicChange);
      tipoSlot?.removeEventListener('change', onTipoChange);
      gachaSlot?.removeEventListener('change', onGachaChange);
    };
  }, [hosts, tab]);

  const hasOpenPanel =
    (avail.styles && state.open.styles) ||
    (avail.dynamic && state.open.dynamic) ||
    state.open.picker ||
    (avail.tipo && state.open.tipo) ||
    (avail.gacha && state.open.gacha);

  // Sync stage-open and studio-collapsed attributes on toprow and tab root
  useEffect(() => {
    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    const topRow = root.querySelector<HTMLElement>(`#${tab}_toprow`);
    if (topRow) {
      if (wbLayout === 'stage' && hasOpenPanel) topRow.dataset.lobeStageOpen = 'true';
      else delete topRow.dataset.lobeStageOpen;
    }
    const tabNode = root.querySelector<HTMLElement>(`#tab_${tab}`);
    if (tabNode) {
      if (isStudioMode) tabNode.dataset.lobeStudioCollapsed = studioParamsOpen ? 'false' : 'true';
      else delete tabNode.dataset.lobeStudioCollapsed;
    }
  }, [hasOpenPanel, hosts, isStudioMode, studioParamsOpen, tab, wbLayout]);

  if (!hosts) return null;

  const topContent = (
    <div className={styles.topBar}>
      <div className={styles.toolsHost} ref={toolsSlotRef} />
    </div>
  );

  const bottomContent = (
    <div className={styles.bottomWrap}>
      <div className={styles.pillBar}>
        {avail.styles && (
          <button
            className={cx(styles.pill, state.open.styles && styles.pillActive)}
            onClick={() => togglePanel('styles')}
            type="button"
          >
            <Palette className={styles.pillIcon} size={13} />
            <span>{t('prompt.workbench.styles', { defaultValue: 'Styles' })}</span>
            {state.open.styles ? <ChevronDown className={styles.pillChevron} size={13} /> : <ChevronRight className={styles.pillChevron} size={13} />}
          </button>
        )}
        {avail.dynamic && (
          <button
            className={cx(
              styles.pill,
              avail.dynamicEnabled && styles.pillEnabled,
              state.open.dynamic && styles.pillActive,
            )}
            onClick={() => togglePanel('dynamic')}
            type="button"
          >
            {avail.dynamicEnabled ? <span className={styles.statusDot} /> : <Wand2 className={styles.pillIcon} size={13} />}
            <span>Dynamic Prompts</span>
            {state.open.dynamic ? <ChevronDown className={styles.pillChevron} size={13} /> : <ChevronRight className={styles.pillChevron} size={13} />}
          </button>
        )}
        <button
          className={cx(styles.pill, state.open.picker && styles.pillActive)}
          onClick={() => togglePanel('picker')}
          type="button"
        >
          <Tags className={styles.pillIcon} size={13} />
          <span>{t('prompt.workbench.picker', { defaultValue: 'Tag Picker' })}</span>
          {state.open.picker ? <ChevronDown className={styles.pillChevron} size={13} /> : <ChevronRight className={styles.pillChevron} size={13} />}
        </button>
        {avail.tipo && (
          <button
            className={cx(
              styles.pill,
              avail.tipoEnabled && styles.pillEnabled,
              state.open.tipo && styles.pillActive,
            )}
            onClick={() => togglePanel('tipo')}
            type="button"
          >
            {avail.tipoEnabled ? <span className={styles.statusDot} /> : <Sparkles className={styles.pillIcon} size={13} />}
            <span>TIPO</span>
            {state.open.tipo ? <ChevronDown className={styles.pillChevron} size={13} /> : <ChevronRight className={styles.pillChevron} size={13} />}
          </button>
        )}
        {avail.gacha && (
          <button
            className={cx(
              styles.pill,
              avail.gachaEnabled && styles.pillEnabled,
              state.open.gacha && styles.pillActive,
            )}
            onClick={() => togglePanel('gacha')}
            type="button"
          >
            {avail.gachaEnabled ? <span className={styles.statusDot} /> : <Dices className={styles.pillIcon} size={13} />}
            <span>{t('prompt.workbench.booruLite', { defaultValue: 'Booru Tags Lite' })}</span>
            {state.open.gacha ? <ChevronDown className={styles.pillChevron} size={13} /> : <ChevronRight className={styles.pillChevron} size={13} />}
          </button>
        )}
        {avail.tipoPrompt && (
          <button
            className={cx(
              styles.pill,
              !hideTipoPrompt && styles.pillEnabled,
            )}
            onClick={() => void onSetSetting({ hideTipoPrompt: !hideTipoPrompt })}
            type="button"
          >
            <span className={cx(styles.toggleDot, !hideTipoPrompt && styles.toggleDotOn)} />
            <span>{t('prompt.workbench.tipoPrompt', { defaultValue: 'TIPO prompt' })}</span>
          </button>
        )}
        {isStudioMode && (
          <button
            className={cx(styles.pill, studioParamsOpen && styles.pillActive)}
            onClick={() => setStudioParamsOpen((prev) => !prev)}
            style={{ marginLeft: 'auto' }}
            type="button"
          >
            <SlidersHorizontal className={styles.pillIcon} size={13} />
            <span>{studioParamsOpen ? t('prompt.workbench.hideSettings', { defaultValue: 'Hide settings' }) : t('prompt.workbench.settings', { defaultValue: 'Settings' })}</span>
          </button>
        )}
      </div>
    </div>
  );

  const stageContent = (
    <div className={styles.panelWrap} style={hasOpenPanel ? undefined : { display: 'none' }}>
      {/* Keep Gradio-backed slots mounted and toggle visibility via display */}
      <div
        className={styles.panelCard}
        ref={stylesSlotRef}
        style={avail.styles && state.open.styles ? undefined : { display: 'none' }}
      />
      <div
        className={styles.accordionSlot}
        ref={dynamicSlotRef}
        style={avail.dynamic && state.open.dynamic ? undefined : { display: 'none' }}
      />
      {state.open.picker && (
        <div className={styles.panelCard}>
          <Suspense fallback={<span role="status">{t('custom.initializing')}</span>}>
            <PromptPicker tab={`tab_${tab}`} />
          </Suspense>
        </div>
      )}
      <div
        className={styles.accordionSlot}
        ref={tipoSlotRef}
        style={avail.tipo && state.open.tipo ? undefined : { display: 'none' }}
      />
      <div
        className={styles.accordionSlot}
        ref={gachaSlotRef}
        style={avail.gacha && state.open.gacha ? undefined : { display: 'none' }}
      />
    </div>
  );

  return (
    <>
      {createPortal(topContent, hosts.top)}
      {createPortal(bottomContent, hosts.bottom)}
      {createPortal(stageContent, hosts.stage)}
    </>
  );
});

const PromptWorkbench = memo(() => (
  <>
    <TabWorkbench tab="txt2img" />
    <TabWorkbench tab="img2img" />
  </>
));

export default PromptWorkbench;
