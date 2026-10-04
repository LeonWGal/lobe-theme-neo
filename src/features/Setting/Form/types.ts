import { FormGroupItemType } from '@lobehub/ui';

import { WebuiSettingKeys } from '@/store';

export type SettingItemGroup = FormGroupItemType & {
  children: {
    name?: WebuiSettingKeys | string;
  }[];
};
