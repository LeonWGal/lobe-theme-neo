import { Form as LobeForm } from '@lobehub/ui/form';
import { Form, type FormItemProps, type FormProps } from 'antd';
import { createStyles } from 'antd-style';
import type { ReactNode } from 'react';

import type { SettingField, SettingItemGroup } from './types';

const useStyles = createStyles(({ css, token }) => ({
  description: css`
    display: block;
    margin-block-start: 2px;
    color: ${token.colorTextSecondary};
    font-size: 13px;
    line-height: 18px;
  `,
  field: css`
    margin: 0 !important;
    padding: 9px 0;
    &:not(:last-child) { border-bottom: 1px solid ${token.colorBorderSecondary}; }
    .ant-form-item-row { align-items: center; justify-content: space-between; gap: 8px 16px; }
    .ant-form-item-label { flex: 1 1 180px; min-width: 0; text-align: start; }
    .ant-form-item-label > label {
      display: block;
      height: auto;
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .ant-form-item-control { flex: 0 1 auto; min-width: 0; max-width: 100%; }
    &:has(.lobe-neutral-palettes) {
      .ant-form-item-label, .ant-form-item-control { flex: 1 0 100%; }
    }
    .ant-select { min-width: min(144px, 100%); max-width: 100%; }
    .lobe-color-swatches, .ant-segmented-group { flex-wrap: wrap; }
    .lobe-color-swatches { max-width: 100%; }
    @container lobe-settings (max-width: 520px) {
      .ant-form-item-label { flex: 1 0 100%; }
    }
  `,
  form: css`
    container: lobe-settings / inline-size;
    min-width: 0;
  `,
}));

type FieldsProps<T> = Omit<FormProps<T>, 'children' | 'variant'> & {
  footer?: ReactNode;
  variant?: 'borderless';
} & ({ items: SettingField[]; itemsType: 'flat' } | { items: SettingItemGroup[]; itemsType?: 'group' });

export default function Fields<T>({ footer, variant, ...props }: FieldsProps<T>) {
  const { styles } = useStyles();
  const renderField = ({ children, desc, divider, label, minWidth, ...field }: SettingField, index: number) => (
    <Form.Item
      {...field as FormItemProps}
      className={styles.field}
      key={field.name ?? index}
      label={<>{label}{desc && <small className={styles.description}>{desc}</small>}</>}
      style={{ borderBottom: divider === false ? 0 : undefined, minWidth }}
    >
      {children}
    </Form.Item>
  );
  const { items, itemsType, ...form } = props;

  return (
    <Form<T> {...form} className={[styles.form, form.className].filter(Boolean).join(' ')} colon={false} layout="horizontal" style={{ width: '100%', ...form.style }}>
      {itemsType === 'flat' ? items.map(renderField) : items.filter((item) => !item.hidden).map(({ children, ...group }, index) => {
        const groupProps = { ...group };
        delete groupProps.hidden;
        return (
          <LobeForm.Group {...groupProps} key={group.key ?? index} variant={variant}>
            {children.map(renderField)}
          </LobeForm.Group>
        );
      })}
      {footer && <LobeForm.Footer>{footer}</LobeForm.Footer>}
    </Form>
  );
}
