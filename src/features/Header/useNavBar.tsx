import { TabsNavProps } from '@lobehub/ui';
import { consola } from 'consola';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSelectorHide } from '@/hooks/useSelectorHide';

import { genNavList, getNavButtons } from './genNavList';

export const useNavBar = (mobile?: boolean) => {
  const [items, setItems] = useState<TabsNavProps['items']>([]);
  const [navList, setNavList] = useState(() => genNavList());

  const refreshNav = useCallback(() => {
    const list = genNavList();
    if (list.length > 0) {
      setNavList(list);
    }
  }, []);

  const onChange: TabsNavProps['onChange'] = useCallback(
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
    const tabsContainer = root.querySelector('#tabs');
    if (!tabsContainer) return;

    const observer = new MutationObserver(() => {
      refreshNav();
    });

    observer.observe(tabsContainer, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [refreshNav]);

  useEffect(() => {
    try {
      const list: TabsNavProps['items'] = navList.map((item) => {
        return {
          key: item.id,
          label: mobile ? <div onClick={() => onChange(item.id)}>{item.label}</div> : item.label,
        };
      });
      setItems(list.filter(Boolean));
      consola.success('🤯 [layout] inject - Header');
    } catch (error) {
      consola.error('🤯 [layout] inject - Header', error);
    }
  }, [navList, mobile, onChange]);

  return {
    items,
    onChange,
  };
};
