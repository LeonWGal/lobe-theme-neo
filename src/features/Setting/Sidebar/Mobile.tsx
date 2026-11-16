import { Segmented } from 'antd';
import { memo } from 'react';

import { SettingsTabs } from '@/features/Setting/Sidebar/index';
import { useTabItems } from '@/features/Setting/Sidebar/useTabItems';

interface SidebarProps {
  setTab: (tab: SettingsTabs) => void;
  tab: string;
}

const MobileSidebar = memo<SidebarProps>(({ tab, setTab }) => {
  const items = useTabItems();
  return (
    <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Segmented
        onChange={setTab as any}
        options={items.map(({ key, label }) => ({ label, value: key }))}
        value={tab}
      />
    </div>
  );
});

export default MobileSidebar;
