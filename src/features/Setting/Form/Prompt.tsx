import { Segmented, Switch } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSettingDraft } from '../Draft';
import Form from './DraftForm';
import { SettingItemGroup } from './types';

const PromptForm = memo(() => {
  const { draft: setting, updateDraft, apply } = useSettingDraft();
  const { t } = useTranslation();

  const workbench: SettingItemGroup = useMemo(
    () => ({
      children: [
        {
          children: <Switch />,
          desc: t('setting.workbench.desc', {
            defaultValue: 'Enable the compact Prompt Workbench bar (Text/Tags switch, quick tools and collapsible panels).',
          }),
          label: t('setting.workbench.title', { defaultValue: 'Prompt Workbench' }),
          name: 'enableWorkbench',
          valuePropName: 'checked',
        },
        {
          children: <Switch />,
          desc: t('setting.hideTipoPrompt.desc', {
            defaultValue: 'Hide TIPO Tag/NL prompt fields and the Generate Prompt button in the prompt area.',
          }),
          label: t('setting.hideTipoPrompt.title', { defaultValue: 'Hide TIPO prompt & button' }),
          name: 'hideTipoPrompt',
          valuePropName: 'checked',
        },
      ],
      title: t('setting.group.workbench', { defaultValue: 'Workbench' }),
    }),
    [t],
  );

  const editor: SettingItemGroup = useMemo(
    () => ({
      children: [
        {
          children: <Switch />,
          desc: t('setting.promptHighlight.desc'),
          label: t('setting.promptHighlight.title'),
          name: 'enableHighlight',
          valuePropName: 'checked',
        },
        {
          children: <Switch />,
          desc: t('setting.promptSections.desc'),
          label: t('setting.promptSections.title'),
          name: 'promptSections',
          valuePropName: 'checked',
        },
        {
          children: <Switch />,
          desc: t('setting.promptEditor.desc'),
          label: t('setting.promptEditor.title'),
          name: 'promptEditor',
          valuePropName: 'checked',
        },
        {
          children: (
            <Segmented
              options={[
                {
                  label: t('setting.promptDisplayMode.scroll'),
                  value: 'scroll',
                },
                {
                  label: t('setting.promptDisplayMode.resizable'),
                  value: 'resizable',
                },
              ]}
            />
          ),
          desc: t('setting.promptDisplayMode.desc'),
          label: t('setting.promptDisplayMode.title'),
          name: 'promptTextareaType',
        },
      ],
      title: t('setting.group.promptTextarea'),
    }),
    [t],
  );

  const highlightDisabled = !setting.enableHighlight;

  const highlightCategories: SettingItemGroup = useMemo(
    () => ({
      children: [
        {
          children: <Switch disabled={highlightDisabled} />,
          desc: t('setting.highlightCategories.tagColors.desc'),
          label: t('setting.highlightCategories.tagColors.title'),
          name: 'highlightTagColors',
          valuePropName: 'checked',
        },
        {
          children: <Switch disabled={highlightDisabled} />,
          desc: t('setting.highlightCategories.models.desc'),
          label: t('setting.highlightCategories.models.title'),
          name: 'highlightModels',
          valuePropName: 'checked',
        },
        {
          children: <Switch disabled={highlightDisabled} />,
          desc: t('setting.highlightCategories.weights.desc'),
          label: t('setting.highlightCategories.weights.title'),
          name: 'highlightWeights',
          valuePropName: 'checked',
        },
        {
          children: <Switch disabled={highlightDisabled} />,
          desc: t('setting.highlightCategories.wildcards.desc'),
          label: t('setting.highlightCategories.wildcards.title'),
          name: 'highlightWildcards',
          valuePropName: 'checked',
        },
        {
          children: <Switch disabled={highlightDisabled} />,
          desc: t('setting.highlightCategories.keywords.desc'),
          label: t('setting.highlightCategories.keywords.title'),
          name: 'highlightKeywords',
          valuePropName: 'checked',
        },
      ],
      title: t('setting.highlightCategories.title'),
    }),
    [highlightDisabled, t],
  );

  return (
    <Form
      id="theme_settings"
      initialValues={setting}
      items={[workbench, editor, highlightCategories]}
      onFinish={apply}
      onValuesChange={(changed) => updateDraft(changed)}
      style={{ flex: 1 }}
      variant={'borderless'}
    />
  );
});

export default PromptForm;
