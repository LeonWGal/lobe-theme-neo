import { ActionIcon, DraggablePanelContent, DraggablePanelHandle, DraggablePanelRoot, DraggablePanelToggle } from '@lobehub/ui';
import { message } from 'antd';
import { useTheme } from 'antd-style';
import { ChevronLeft, ChevronRight, Pin, PinOff } from '@/icons';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { useFloatingSidebar } from '@/hooks/useFloatingSidebar';
import { useOverlaySidebars } from '@/hooks/useOverlaySidebars';
import { useSidebarFocus } from '@/hooks/useSidebarFocus';
import { type WebuiSetting, useAppStore } from '@/store';

interface ThemeSidebarProps {
  children: ReactNode;
  headerHeight: number;
  kind: 'quick' | 'extra';
  title: string;
}
const activateOnKey = (event: ReactKeyboardEvent<HTMLElement>) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  event.currentTarget.click();
};

export default function ThemeSidebar({ children, headerHeight, kind, title }: ThemeSidebarProps) {
  const widthKey = kind === 'quick' ? 'sidebarWidth' : 'extraNetworkSidebarWidth';
  const expandKey = kind === 'quick' ? 'sidebarExpand' : 'extraNetworkSidebarExpand';
  const pinKey = kind === 'quick' ? 'sidebarFixedMode' : 'extraNetworkFixedMode';
  const savedWidth = useAppStore((state) => state.setting[widthKey]);
  const savedExpand = useAppStore((state) => state.setting[expandKey]);
  const pin = useAppStore((state) => state.setting[pinKey] === 'fixed');
  const save = useAppStore((state) => state.onSetSetting);
  const mobileOpen = useAppStore((state) => state.mobileSidebar === kind);
  const setMobileSidebar = useAppStore((state) => state.setMobileSidebar);
  const { overlay } = useOverlaySidebars();
  const theme = useTheme();
  const { t } = useTranslation();
  const [width, setWidth] = useState(savedWidth);
  const [expand, setExpand] = useState(savedExpand);
  const panelRef = useRef<HTMLDivElement>(null);
  const minWidth = 280;
  const controlledVisible = overlay ? mobileOpen : expand;
  const floating = useFloatingSidebar(panelRef, !overlay && !pin && expand, controlledVisible);
  const visible = controlledVisible && (overlay || pin || floating.isVisible());
  const previousOverlay = useRef(overlay);
  const closeMobile = () => setMobileSidebar('none');
  const side = kind === 'quick' ? 'left' : 'right';
  const OpenIcon = side === 'left' ? ChevronRight : ChevronLeft;
  const CloseIcon = side === 'left' ? ChevronLeft : ChevronRight;
  const closeLabel = t('sidebar.collapse', { title });

  useEffect(() => setWidth(savedWidth), [savedWidth]);
  useEffect(() => setExpand(savedExpand), [savedExpand]);
  useEffect(() => {
    if (previousOverlay.current !== overlay) {
      previousOverlay.current = overlay;
      if (useAppStore.getState().mobileSidebar !== 'none') setMobileSidebar('none');
    }
  }, [overlay, setMobileSidebar]);
  useLayoutEffect(() => {
    const panel = panelRef.current?.closest('aside');
    if (!panel) return;
    panel.style.setProperty('--lobe-sidebar-width', `${Math.max(minWidth, width)}px`);
    panel.style.setProperty('--lobe-sidebar-height', `calc(100dvh - ${headerHeight}px)`);
    panel.setAttribute('role', overlay ? 'dialog' : 'complementary');
    panel.setAttribute('aria-label', title);
    if (overlay) {
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-hidden', String(!mobileOpen));
    } else {
      panel.removeAttribute('aria-modal');
      panel.removeAttribute('aria-hidden');
    }
    const arrow = panel.querySelector<HTMLButtonElement>('.lobe-sidebar-toggle > button');
    if (!arrow) return;
    arrow.setAttribute('aria-label', title);
    arrow.setAttribute('aria-expanded', String(visible));
  }, [headerHeight, mobileOpen, overlay, title, visible, width]);
  useSidebarFocus(panelRef, overlay && mobileOpen, kind, closeMobile);

  const persist = async (patch: Partial<WebuiSetting>) => {
    try {
      await save(patch);
    } catch {
      const current = useAppStore.getState().setting;
      setWidth(current[widthKey]);
      setExpand(current[expandKey]);
      message.error(t('setting.button.saveError'));
    }
  };
  const close = () => {
    if (overlay) {
      closeMobile();
      return;
    }
    setExpand(false);
    void persist({ [expandKey]: false });
  };

  return (
    <>
      {overlay && !mobileOpen && (
        <button
          aria-expanded={false}
          aria-label={title}
          className={`lobe-sidebar-edge-button lobe-sidebar-${side}`}
          data-lobe-sidebar-trigger={kind}
          onClick={() => setMobileSidebar(kind)}
          title={title}
          type="button"
        >
          <OpenIcon size={16} />
        </button>
      )}
      <button
        aria-label={t('cancel')}
        className="lobe-sidebar-mask"
        hidden={!overlay || !mobileOpen}
        onClick={closeMobile}
        style={{ top: headerHeight }}
        tabIndex={-1}
        type="button"
      />
      {!overlay && !pin && expand && (
        <div
          aria-hidden="true"
          className={`lobe-sidebar-edge lobe-sidebar-${side}`}
          data-lobe-sidebar-edge={kind}
          onPointerEnter={(event) => {
            if (event.pointerType !== 'touch') floating.reveal();
          }}
          onPointerLeave={() => floating.scheduleHide()}
          style={{ top: headerHeight }}
        />
      )}
      <DraggablePanelRoot
        className={`lobe-sidebar-panel lobe-sidebar-${kind === 'quick' ? 'left' : 'right'} ${overlay || !pin ? 'lobe-sidebar-float' : ''} ${overlay ? 'lobe-sidebar-overlay' : ''} ${visible ? '' : 'lobe-sidebar-hidden'}`}
        expand={overlay || !pin ? true : expand}
        expandable
        max={640}
        min={overlay ? 0 : minWidth}
        mode={overlay || !pin ? 'float' : 'fixed'}
        onExpandChange={(next) => {
          if (!pin && (!expand || !floating.isVisible())) {
            floating.reveal();
            if (!expand) {
              setExpand(true);
              void persist({ [expandKey]: true });
            }
            return;
          }
          setExpand(next);
          void persist({ [expandKey]: next });
        }}
        onSizeChange={(size) => {
          const next = Math.max(
            minWidth,
            Math.min(640, Math.round(size)),
          );
          if (!Number.isFinite(next)) return;
          setWidth(next);
          void persist({ [widthKey]: next });
        }}
        placement={kind === 'quick' ? 'left' : 'right'}
        showBorder={false}
        size={Math.max(minWidth, width)}
      >
        {!overlay && <DraggablePanelToggle className="lobe-sidebar-toggle" showHandleWhenCollapsed />}
        <DraggablePanelContent className="lobe-sidebar-panel-inner">
        <div
          aria-hidden={!visible}
          className="lobe-sidebar-content"
          inert={!visible}
          ref={panelRef}
          style={{
            background: theme.colorBgContainer,
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
            width: '100%',
          }}
        >
          <div className="lobe-sidebar-heading">
            <strong>{title}</strong>
            <ActionIcon
              active={pin}
              aria-label={t('sidebar.pin')}
              aria-pressed={pin}
              className="lobe-sidebar-pin"
              icon={pin ? PinOff : Pin}
              onClick={() => void persist({ [pinKey]: pin ? 'float' : 'fixed' })}
              onKeyDown={activateOnKey}
              title={t('sidebar.pin')}
            />
            <ActionIcon
              aria-label={closeLabel}
              className="lobe-sidebar-close"
              icon={CloseIcon}
              onClick={close}
              onKeyDown={activateOnKey}
              title={closeLabel}
            />
          </div>
          {children}
        </div>
        </DraggablePanelContent>
        {!overlay && expand && <DraggablePanelHandle className="lobe-sidebar-resize" wideArea={false} />}
      </DraggablePanelRoot>
    </>
  );
}
