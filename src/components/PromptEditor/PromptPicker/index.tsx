import { Alert, Button, Skeleton } from 'antd';
import { consola } from 'consola';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import useSWR from 'swr';

import { useExternalTextareaObserver } from '@/hooks/useExternalTextareaObserver';
import { selectors, useAppStore } from '@/store';
import { getPrompt } from '@/store/api';
import { getPromptTextarea, setPromptValue } from '@/utils/promptInput';

import { TagItem } from '../TagList';
import { formatPrompt } from '../utils';

const PromptPicker = memo<{ tab?: string }>(({ tab }) => {
  const { data, error, isLoading, mutate } = useSWR('prompt', getPrompt);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [activeObject, setActiveObject] = useState<string>();
  const [activeAttribute, setActiveAttribute] = useState<string>();
  const i18n = useAppStore(selectors.currentLanguage);
  const { t } = useTranslation();
  const storeTab = useAppStore((state) => state.currentTab);
  const currentTab = tab ?? storeTab;
  const value = useExternalTextareaObserver(`#${currentTab.replace(/^tab_/, '')}_prompt textarea`);
  useEffect(() => {
    setTags(formatPrompt(value));
  }, [value, currentTab]);

  const isCN = i18n === 'zh_CN' || i18n === 'zh_HK';

  const getValue = useCallback(() => {
    try {
      const textarea = getPromptTextarea(currentTab);
      if (textarea) {
        const data = formatPrompt(textarea.value);
        setTags(data);
        return data;
      }
      return [];
    } catch (error) {
      consola.error('🤯 [prompt]', error);
      return [];
    }
  }, [currentTab]);

  const setValue = useCallback(
    (currentTags: TagItem[]) => {
      try {
        const newValue = currentTags.map((t) => t.text).join(', ');
        const textarea = getPromptTextarea(currentTab);
        if (textarea) {
          setPromptValue(textarea, newValue);
        }
      } catch (error) {
        consola.error('🤯 [prompt]', error);
      }
    },
    [currentTab],
  );

  const handleTagUpdate = useCallback(
    (tag: TagItem) => {
      let currentTags = getValue() || [];
      const hasTag = currentTags.some(
        (t) => t.text.toLowerCase() === tag.text.toLowerCase() || t.id === tag.id,
      );
      if (hasTag) {
        currentTags = currentTags.filter(
          (t) => t.text.toLowerCase() !== tag.text.toLowerCase() && t.id !== tag.id,
        );
      } else {
        currentTags = [...currentTags, tag].filter(Boolean);
      }

      setTags(currentTags);
      setValue(currentTags);
    },
    [getValue, setValue],
  );

  useEffect(() => {
    getValue();
    if (!data || activeObject || activeAttribute) return;
    const defaultActiveObject = Object.keys(data)[0];
    if (!defaultActiveObject) return;
    setActiveObject(defaultActiveObject);
    const defaultActiveAttribute = Object.keys(data[defaultActiveObject].children)[0];
    setActiveAttribute(defaultActiveAttribute);
  }, [data, activeObject, activeAttribute]);

  if (isLoading) return <Skeleton active />;
  if (error || !data || !Object.keys(data).length)
    return (
      <Alert
        action={<Button onClick={() => void mutate()}>{t('prompt.load')}</Button>}
        title={t('prompt.loadError')}
        type="error"
      />
    );
  if (!['tab_txt2img', 'tab_img2img'].includes(currentTab)) return null;

  return (
    <>
      <span className="lobe-prompt-picker-heading">{t('prompt.area.object')}</span>
      <Flexbox gap={4} horizontal style={{ flexWrap: 'wrap' }}>
        {Object.entries(data).map(([key, value], index) => {
          const name = isCN ? value.langName : value.name;
          const isActive = activeObject ? activeObject === key : index === 0;
          return (
            <Button
              key={key}
              onClick={() => {
                setActiveObject(key);
                setActiveAttribute(Object.keys(data[key].children)[0]);
              }}
              size={'small'}
              style={{ flex: 1 }}
              type={isActive ? 'primary' : 'default'}
            >
              {name}
            </Button>
          );
        })}
      </Flexbox>
      <span className="lobe-prompt-picker-heading">{t('prompt.area.attribute')}</span>
      <Flexbox gap={4} horizontal style={{ flexWrap: 'wrap' }}>
        {activeObject &&
          Object.entries(data[activeObject].children).map(([key, value], index) => {
            const name = isCN ? value.langName : value.name;
            const isActive = activeAttribute ? activeAttribute === key : index === 0;
            return (
              <Button
                key={key}
                onClick={() => setActiveAttribute(key)}
                size={'small'}
                style={{ flex: 1 }}
                type={isActive ? 'primary' : 'default'}
              >
                {name}
              </Button>
            );
          })}
      </Flexbox>
      <span className="lobe-prompt-picker-heading">{t('prompt.area.tag')}</span>
      <Flexbox gap={4} horizontal style={{ flexWrap: 'wrap' }}>
        {activeObject &&
          activeAttribute &&
          Object.entries(data[activeObject].children[activeAttribute].children).map(
            ([key, value]) => {
              const isActive = tags.some(
                (tag) => tag.text.toLowerCase() === value.name.toLowerCase(),
              );
              return (
                <Button
                  key={key}
                  onClick={() => handleTagUpdate({ id: key, text: value.name })}
                  size={'small'}
                  style={isCN ? { flex: 1, height: 36 } : { flex: 1 }}
                  type={isActive ? 'primary' : 'dashed'}
                >
                  {isCN ? (
                    <Flexbox gap={2}>
                      <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1 }}>
                        {value.langName}
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1, opacity: 0.75 }}>{value.name}</div>
                    </Flexbox>
                  ) : (
                    value.name
                  )}
                </Button>
              );
            },
          )}
      </Flexbox>
    </>
  );
});

export default PromptPicker;
