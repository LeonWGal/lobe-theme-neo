import { memo, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useOverlaySidebars } from '@/hooks/useOverlaySidebars';
import { selectors, useAppStore } from '@/store';

import TabLauncher from './TabLauncher';
import { useNavBar } from './useNavBar';
import { useNavPins } from './useNavPins';

const Nav = memo(() => {
  const currentTab = useAppStore(selectors.currentTab);
  const { compact } = useOverlaySidebars();
  const { list, onChange } = useNavBar();
  const { pins, toggle, reset } = useNavPins();
  const { t } = useTranslation();
  const rail = useRef<HTMLDivElement>(null);
  const visible = compact ? list : list.filter(({ id }) => pins.includes(id) || id === currentTab);

  useLayoutEffect(() => {
    const element = rail.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1;
      const limit = element.scrollWidth - element.clientWidth;
      const next = Math.max(0, Math.min(limit, element.scrollLeft + event.deltaY * scale));
      if (next === element.scrollLeft) return;
      event.preventDefault();
      element.scrollLeft = next;
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, []);

  useLayoutEffect(() => {
    const element = rail.current;
    const active = element?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!element || !active) return;
    const viewport = element.getBoundingClientRect();
    const tab = active.getBoundingClientRect();
    if (tab.left < viewport.left) element.scrollLeft += tab.left - viewport.left - 4;
    else if (tab.right > viewport.right) element.scrollLeft += tab.right - viewport.right + 4;
  }, [currentTab, compact, list, pins]);

  return (
    <nav aria-label={t('header.nav.allTabs')} className="lobe-header-navigation">
      <div className="lobe-header-tabs" ref={rail}>
        {visible.map(({ id, label }) => (
          <button
            aria-current={id === currentTab ? 'page' : undefined}
            className="lobe-header-tab"
            key={id}
            onClick={() => onChange(id)}
            title={label}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <TabLauncher
        activeKey={currentTab}
        compact={compact}
        hiddenCount={list.length - visible.length}
        items={list}
        onOpen={onChange}
        onReset={reset}
        onTogglePin={toggle}
        pins={pins}
      />
    </nav>
  );
});

export default Nav;
