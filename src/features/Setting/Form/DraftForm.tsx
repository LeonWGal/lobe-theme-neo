import { Form as AntForm } from 'antd';
import { type ComponentProps, useEffect } from 'react';

import type { WebuiSetting } from '@/store';

import { useSettingDraft } from '../Draft';
import Form from './Fields';

const DraftForm = (props: ComponentProps<typeof Form<WebuiSetting>>) => {
  const { draft, apply, updateDraft } = useSettingDraft();
  const [form] = AntForm.useForm<WebuiSetting>();
  useEffect(() => {
    form.setFieldsValue(draft);
  }, [draft, form]);
  return (
    <Form<WebuiSetting>
      {...props}
      form={form}
      initialValues={draft}
      onFinish={apply}
      onValuesChange={(changed) => updateDraft(changed)}
    />
  );
};

export default DraftForm;
