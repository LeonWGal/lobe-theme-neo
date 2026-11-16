import type { Form, FormFieldProps } from '@lobehub/ui/form';
import type { FormItemProps } from 'antd';
import type { ComponentProps } from 'react';

import { WebuiSettingKeys } from '@/store';

type FormGroupProps = ComponentProps<typeof Form.Group>;

export type SettingField = Pick<FormFieldProps, 'children' | 'desc' | 'divider' | 'hidden' | 'label' | 'minWidth'> & {
  name?: WebuiSettingKeys | string;
  valuePropName?: FormItemProps['valuePropName'];
};

export type SettingItemGroup = Partial<Pick<FormGroupProps, 'collapsible' | 'defaultActive' | 'desc' | 'extra' | 'icon' | 'variant'>> & {
  children: SettingField[];
  hidden?: boolean;
  key?: string;
  title: FormGroupProps['title'];
};
