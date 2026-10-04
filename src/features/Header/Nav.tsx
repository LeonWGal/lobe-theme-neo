import { Burger, Tabs } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo, useState } from 'react';

import { selectors, useAppStore } from '@/store';

import { useNavBar } from './useNavBar';

const Nav = memo(() => {
  const currentTab = useAppStore(selectors.currentTab);
  const { mobile } = useResponsive();
  const { items, onChange } = useNavBar(mobile);
  const [opened, setOpened] = useState(false);

  if (mobile) return <Burger items={items as any} opened={opened} setOpened={setOpened} />;

  return <Tabs activeKey={currentTab} items={items} onChange={onChange} />;
});

export default Nav;
