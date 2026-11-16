import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useExternalTextareaObserver } from '@/hooks/useExternalTextareaObserver';
import { useAppStore } from '@/store';
import { getPromptTextarea, setPromptValue, undoPromptValue } from '@/utils/promptInput';

import TagList, { type PromptType, type TagItem } from './TagList';
import { useStyles } from './style';
import { formatPrompt } from './utils';

const Prompt = memo<{ tab?: string; type: PromptType }>(({ tab, type }) => {
  const storeTab = useAppStore((st) => st.currentTab);
  const currentTab = tab ?? storeTab;
  const negative = type === 'negative';
  const selector = `#${currentTab.replace(/^tab_/, '')}_${negative ? 'neg_prompt' : 'prompt'} textarea`;
  const value = useExternalTextareaObserver(selector, true);
  const [tags, setTags] = useState<TagItem[]>(() => formatPrompt(value));
  const { styles } = useStyles();
  const { t } = useTranslation();
  const renderedValue = useRef(value);

  useEffect(() => {
    const next = getPromptTextarea(currentTab, negative)?.value ?? value;
    renderedValue.current = next;
    setTags(formatPrompt(next));
  }, [value, currentTab, negative]);
  const getValue = useCallback(() => {
    const textarea = getPromptTextarea(currentTab, negative);
    if (textarea) {
      renderedValue.current = textarea.value;
      setTags(formatPrompt(textarea.value));
    }
  }, [currentTab, negative]);
  const setCurrentValue = useCallback(
    (currentTags: TagItem[]) => {
      const textarea = getPromptTextarea(currentTab, negative);
      if (!textarea) return;
      const base = textarea.value === renderedValue.current ? tags : formatPrompt(textarea.value);
      const next = [...currentTags];
      if (base !== tags) {
        // A tag action can land before the deferred editor refresh. Preserve new text.
        const addition = next.length > tags.length && tags.every((tag, index) => tag === next[index]);
        if (!addition) {
          renderedValue.current = textarea.value;
          setTags(base);
          return;
        }
        next.splice(0, tags.length, ...base);
      }
      const text = next.map((tag) => tag.text).join(', ');
      renderedValue.current = text;
      setPromptValue(textarea, text);
    },
    [currentTab, negative, tags],
  );

  if (!['tab_txt2img', 'tab_img2img'].includes(currentTab)) return null;
  return (
    <div className={styles.promptView}>
      <TagList
        key={`${currentTab}:${type}`}
        setTags={setTags}
        setValue={setCurrentValue}
        tags={tags}
        type={type}
      />
      <Flexbox gap={8} horizontal>
        <button className="secondary gradio-button" onClick={getValue} type="button">
          {t('prompt.load')}
        </button>
        <button
          className="secondary gradio-button"
          onClick={() => setCurrentValue(tags)}
          type="button"
        >
          {t('prompt.set')}
        </button>
        <button
          className="secondary gradio-button"
          onClick={() => {
            const textarea = getPromptTextarea(currentTab, negative);
            if (textarea) undoPromptValue(textarea);
          }}
          type="button"
        >
          {t('prompt.undo')}
        </button>
      </Flexbox>
    </div>
  );
});

export default Prompt;
