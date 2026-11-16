import { memo } from 'react';

import VersionTag from '../../../components/VersionTag';
import Menu from './Menu';
import SidebarLayout from './SidebarLayout';
import { useTabItems } from './useTabItems';

export enum SettingsTabs {
  Appearance = 'appearance',
  Autocomplete = 'autocomplete',
  Experimental = 'experimental',
  Layout = 'layout',
  Prompt = 'prompt',
  Queue = 'queue',
  Resolution = 'resolution',
  Sidebar = 'sidebar',
  Workspace = 'workspace',
}

interface SidebarProps {
  setTab: (tab: SettingsTabs) => void;
  tab: string;
}

const Sidebar = memo<SidebarProps>(({ tab, setTab }) => {
  const items = useTabItems();
  return (
    <SidebarLayout desc={<VersionTag />}>
      <Menu
        items={items}
        onClick={({ key }) => setTab(key as SettingsTabs)}
        selectable
        selectedKeys={[tab as any]}
      />
    </SidebarLayout>
  );
});

export default Sidebar;

export { default as MobileSidebar } from './Mobile';
