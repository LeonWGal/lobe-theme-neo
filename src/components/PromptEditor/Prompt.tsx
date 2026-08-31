import { consola } from 'consola';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import TagList, { PromptType, TagItem } from './TagList';
import { useStyles } from './style';
import { formatPrompt } from './utils';

interface PromptProps {
  type: PromptType;
}

const Prompt = memo<PromptProps>(({ type }) => {
  const [tags, setTags] = useState<TagItem[]>([]);
  const { styles } = useStyles();
  const { t } = useTranslation();

  const id =
    type === 'positive' ? "[id$='2img_prompt'] textarea" : "[id$='2img_neg_prompt'] textarea";

  const getActiveTabContent = () => {
    if (typeof (window as any).get_uiCurrentTabContent === 'function') {
      try {
        const el = (window as any).get_uiCurrentTabContent();
        if (el) return el;
      } catch {}
    }
    const root = typeof gradioApp === 'function' ? gradioApp() : document;
    return (
      root.querySelector(
        '.tabitem[style*="display: block"], .tabitem:not([style*="display: none"]), [id^="tab_txt2img"], [id^="tab_img2img"]',
      ) || root
    );
  };

  const dispatchUpdate = (textarea: HTMLTextAreaElement) => {
    if (typeof (window as any).updateInput === 'function') {
      try {
        (window as any).updateInput(textarea);
      } catch {}
    }
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const getValue = useCallback(() => {
    try {
      const container = getActiveTabContent();
      const textarea = container?.querySelector(id) as HTMLTextAreaElement | null;
      if (textarea) setTags(formatPrompt(textarea.value));
    } catch (error) {
      consola.error('🤯 [prompt]', error);
    }
  }, [id]);

  const setValue = useCallback(() => {
    try {
      const newValue = tags.map((t) => t.text).join(', ');
      const container = getActiveTabContent();
      const textarea = container?.querySelector(id) as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.value = newValue;
        dispatchUpdate(textarea);
      }
    } catch (error) {
      consola.error('🤯 [prompt]', error);
    }
  }, [tags, id]);

  const setCurrentValue = useCallback((currentTags: TagItem[]) => {
    try {
      const container = getActiveTabContent();
      const textarea = container?.querySelector(id) as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.value = currentTags.map((t) => t.text).join(', ');
        dispatchUpdate(textarea);
      }
    } catch (error) {
      consola.error('🤯 [prompt]', error);
    }
  }, [id]);

  return (
    <div className={styles.promptView}>
      <TagList setTags={setTags} setValue={setCurrentValue} tags={tags} type={type} />
      <Flexbox gap={8} horizontal>
        <button
          className="secondary gradio-button"
          onClick={getValue}
          style={{ flex: 1, height: 36 }}
          title={t('prompt.load')}
          type="button"
        >
          🔄
        </button>
        <button
          className="secondary gradio-button"
          onClick={setValue}
          style={{ flex: 1, height: 36 }}
          title={t('prompt.set')}
          type="button"
        >
          ➡️
        </button>
      </Flexbox>
    </div>
  );
});

export default Prompt;
