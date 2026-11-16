import { TabsProps } from '@lobehub/ui';
import { consola } from 'consola';
import isEqual from 'fast-deep-equal';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSelectorHide } from '@/hooks/useSelectorHide';

import { genNavList, getNavButtons } from './genNavList';

export const useNavBar = () => {
  const [navList, setNavList] = useState(() => genNavList());

  const refreshNav = useCallback(() => {
    const list = genNavList();
    if (list.length > 0) {
      setNavList((previous) => (isEqual(previous, list) ? previous : list));
    }
  }, []);

  const onChange: TabsProps['onChange'] = useCallback(
    (id: string) => {
      consola.debug('🤯 [nav] onClick', id);
      const index = navList.find((nav) => nav.id === id)?.index ?? 0;
      const buttonList = getNavButtons();
      if (buttonList[index]) {
        buttonList[index].click();
      }
    },
    [navList],
  );

  useSelectorHide('#tabs > .tab-nav:first-of-type');

  useEffect(() => {
    refreshNav();

    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document.body;
    let tabs: Element | null = null;
    let nav: Element | null = null;
    const navObserver = new MutationObserver(refreshNav);
    let tabsObserver: MutationObserver;
    let discovery: MutationObserver;
    function attachNav() {
      const next = tabs?.querySelector(':scope > .tab-nav') || null;
      if (next === nav) return;
      navObserver.disconnect();
      nav = next;
      if (nav) navObserver.observe(nav, { characterData: true, childList: true, subtree: true });
    }
    function attachTabs() {
      const next = root.querySelector('#tabs');
      if (!next) return;
      tabs = next;
      discovery.disconnect();
      tabsObserver.observe(tabs, { childList: true });
      attachNav();
      refreshNav();
    }
    tabsObserver = new MutationObserver(() => {
      attachNav();
      refreshNav();
    });
    discovery = new MutationObserver(attachTabs);
    discovery.observe(root, { childList: true, subtree: true });
    attachTabs();
    return () => {
      discovery.disconnect();
      tabsObserver.disconnect();
      navObserver.disconnect();
    };
  }, [refreshNav]);

  const items = useMemo(
    () => navList.map((item) => ({ key: item.id, label: item.label })),
    [navList],
  );

  return {
    items,
    list: navList,
    onChange,
  };
};
