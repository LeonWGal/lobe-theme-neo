import { Alert, InputNumber, Segmented, Select, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSettingDraft } from '../Draft';
import Form from './DraftForm';
import type { SettingItemGroup } from './types';

export default function FormAutocomplete() {
  const { draft, apply, updateDraft } = useSettingDraft();
  const { t } = useTranslation();
  const [dictionaries, setDictionaries] = useState<string[]>([]);
  const [chants, setChants] = useState<string[]>([]);
  const [available, setAvailable] = useState<boolean>();
  const [forgeDictionary, setForgeDictionary] = useState<string>();
  useEffect(() => {
    const controller = new AbortController();
    fetch('/lobe/autocomplete/catalog', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Autocomplete catalog unavailable');
        const data: { chants?: string[]; dictionaries: string[]; selected?: string } = await response.json();
        setDictionaries(data.dictionaries);
        setChants(data.chants ?? []);
        setForgeDictionary(data.selected);
        setAvailable(true);
      })
      .catch(() => { if (!controller.signal.aborted) setAvailable(false); });
    return () => controller.abort();
  }, []);
  const inherited = [
    { label: t('autocomplete.inherit'), value: 'inherit' },
    { label: t('autocomplete.on'), value: 'on' },
    { label: t('autocomplete.off'), value: 'off' },
  ];
  const integrated = draft.autocompleteMode === 'lobe';
  const enabled = draft.autocompleteMode !== 'off';
  const allDictionaries = [...new Set([
    ...dictionaries,
    ...(!draft.autocompleteDictionary || draft.autocompleteDictionary === 'None' ? [] : [draft.autocompleteDictionary]),
    ...(draft.autocompleteExtraFiles ?? []),
  ])];
  const allChants = [...new Set([
    ...chants,
    ...(!draft.autocompleteChantFile || draft.autocompleteChantFile === 'None' ? [] : [draft.autocompleteChantFile]),
  ])];

  const items: SettingItemGroup[] = [
    {
      children: [
        {
          children: <Segmented options={[
            { label: 'Lobe Theme', value: 'lobe' },
            { label: t('autocomplete.classic'), value: 'classic' },
            { label: t('autocomplete.off'), value: 'off' },
          ]} />,
          label: t('autocomplete.mode'),
          name: 'autocompleteMode',
        },
        {
          children: <Select loading={available === undefined} options={[
            { label: forgeDictionary ? `${t('autocomplete.defaultDictionary')} · ${forgeDictionary}` : t('autocomplete.defaultDictionary'), value: '' },
            { label: t('autocomplete.noDictionary'), value: 'None' },
            ...allDictionaries.map((name) => ({ label: name, value: name })),
          ]} popupMatchSelectWidth showSearch={{ optionFilterProp: 'label' }} style={{ width: '100%' }} />,
          hidden: available === false || !enabled,
          label: t('autocomplete.dictionary'),
          name: 'autocompleteDictionary',
        },
        {
          children: <Select
            allowClear
            loading={available === undefined}
            mode="multiple"
            options={allDictionaries.map((name) => ({ label: name, value: name }))}
            placeholder="danbooru_tags_anima_quality.csv, EnglishDictionary.csv…"
            showSearch={{ optionFilterProp: 'label' }}
            style={{ width: '100%' }}
          />,
          desc: t('autocomplete.extraFilesDesc'),
          hidden: available === false || !enabled,
          label: t('autocomplete.extraFiles'),
          name: 'autocompleteExtraFiles',
        },
        {
          children: <Segmented options={[
            { label: t('autocomplete.insertAfter'), value: 'Insert after' },
            { label: t('autocomplete.insertBefore'), value: 'Insert before' },
          ]} />,
          hidden: available === false || !enabled,
          label: t('autocomplete.extraAddMode'),
          name: 'autocompleteExtraAddMode',
        },
        {
          children: <Select loading={available === undefined} options={[
            { label: t('autocomplete.inherit'), value: '' },
            { label: t('autocomplete.off'), value: 'None' },
            ...allChants.map((name) => ({ label: name, value: name })),
          ]} popupMatchSelectWidth showSearch={{ optionFilterProp: 'label' }} style={{ width: '100%' }} />,
          hidden: available === false || !enabled,
          label: t('autocomplete.chantFile'),
          name: 'autocompleteChantFile',
        },
        {
          children: <Segmented options={[
            { label: t('autocomplete.field'), value: 'field' },
            { label: t('autocomplete.caret'), value: 'caret' },
          ]} />,
          hidden: !integrated,
          label: t('autocomplete.placement'),
          name: 'autocompletePlacement',
        },
        {
          children: <InputNumber max={50} min={5} precision={0} />,
          desc: t('autocomplete.limitDesc'),
          hidden: !integrated,
          label: t('autocomplete.limit'),
          name: 'autocompleteLimit',
        },
        {
          children: <InputNumber max={2000} min={0} precision={0} step={25} />,
          hidden: !enabled,
          label: t('autocomplete.delayTime'),
          name: 'autocompleteDelayTime',
        },
        {
          children: <Segmented options={inherited} />,
          hidden: !integrated,
          label: t('autocomplete.history'),
          name: 'autocompleteHistory',
        },
        {
          children: <Segmented options={inherited} />,
          hidden: !integrated,
          label: t('autocomplete.negative'),
          name: 'autocompleteNegative',
        },
      ],
      desc: t('autocomplete.description'),
      title: t('autocomplete.title'),
    },
    {
      children: [
        {
          children: <Switch />,
          label: t('autocomplete.replaceUnderscores'),
          name: 'autocompleteReplaceUnderscores',
          valuePropName: 'checked',
        },
        {
          children: <Switch />,
          label: t('autocomplete.escapeParentheses'),
          name: 'autocompleteEscapeParentheses',
          valuePropName: 'checked',
        },
        {
          children: <Switch />,
          label: t('autocomplete.appendComma'),
          name: 'autocompleteAppendComma',
          valuePropName: 'checked',
        },
        {
          children: <Switch />,
          label: t('autocomplete.appendSpace'),
          name: 'autocompleteAppendSpace',
          valuePropName: 'checked',
        },
        {
          children: <Segmented options={[
            { label: t('autocomplete.off'), value: 'Off' },
            { label: t('autocomplete.formatManual'), value: 'Manual (Alt+Shift+F)' },
            { label: t('autocomplete.formatAuto'), value: 'Automatic (on blur)' },
          ]} />,
          label: t('autocomplete.formatMode'),
          name: 'autocompleteFormatMode',
        },
      ],
      hidden: !enabled,
      title: t('autocomplete.insertionTitle'),
    },
    {
      children: [
        {
          children: <Segmented options={[
            { label: t('autocomplete.off'), value: 'Off' },
            { label: t('autocomplete.loraArchFirst'), value: 'Show matching first' },
            { label: t('autocomplete.loraArchHide'), value: 'Hide other architectures' },
          ]} />,
          label: t('autocomplete.loraArchFilter'),
          name: 'autocompleteLoraArchFilter',
        },
        {
          children: <Segmented options={[
            { label: t('autocomplete.modelKeywordNever'), value: 'Never' },
            { label: t('autocomplete.modelKeywordOnlyList'), value: 'Only user list' },
            { label: t('autocomplete.modelKeywordAlways'), value: 'Always' },
          ]} />,
          label: t('autocomplete.modelKeywordCompletion'),
          name: 'autocompleteModelKeywordCompletion',
        },
        {
          children: <Select options={[
            { label: t('autocomplete.locStart'), value: 'Start of prompt' },
            { label: t('autocomplete.locEnd'), value: 'End of prompt' },
            { label: t('autocomplete.locBeforeLora'), value: 'Before LORA' },
            { label: t('autocomplete.locAfterLora'), value: 'After LORA' },
          ]} style={{ width: '100%' }} />,
          label: t('autocomplete.modelKeywordLocation'),
          name: 'autocompleteModelKeywordLocation',
        },
        {
          children: <Segmented options={[
            { label: t('autocomplete.auto'), value: 'Auto' },
            { label: t('autocomplete.off'), value: 'Off' },
          ]} />,
          label: t('autocomplete.animaArtistPrefix'),
          name: 'autocompleteAnimaArtistPrefix',
        },
        {
          children: <Switch />,
          label: t('autocomplete.frequencySort'),
          name: 'autocompleteFrequencySort',
          valuePropName: 'checked',
        },
        {
          children: <Switch />,
          label: t('autocomplete.useWildcards'),
          name: 'autocompleteUseWildcards',
          valuePropName: 'checked',
        },
        {
          children: <Switch />,
          label: t('autocomplete.dimUsedTags'),
          name: 'autocompleteDimUsedTags',
          valuePropName: 'checked',
        },
        {
          children: <Switch />,
          label: t('autocomplete.selectUsedTag'),
          name: 'autocompleteSelectUsedTag',
          valuePropName: 'checked',
        },
      ],
      hidden: !enabled,
      title: t('autocomplete.behaviorTitle'),
    },
  ];

  return (
    <div className="lobe-autocomplete-settings">
      {available === false && !Object.hasOwn(document.documentElement.dataset, 'lobeAutocompleteProvider') && (
        <Alert message={t('autocomplete.unavailable')} type="info" />
      )}
      <Form
        id="theme_settings"
        initialValues={draft}
        items={items}
        onFinish={apply}
        onValuesChange={(changed) => {
          const { autocompleteLimit, autocompleteDelayTime, ...rest } = changed;
          const next = { ...rest } as Record<string, unknown>;
          if (typeof autocompleteLimit === 'number') next.autocompleteLimit = autocompleteLimit;
          if (typeof autocompleteDelayTime === 'number') next.autocompleteDelayTime = autocompleteDelayTime;
          updateDraft(next);
        }}
        variant="borderless"
      />
    </div>
  );
}
