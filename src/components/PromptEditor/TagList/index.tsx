import { useThemeMode } from 'antd-style';
import { consola } from 'consola';
import { type FC, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { WithContext } from 'react-tag-input';

import { attachAutocompleteArea } from '@/features/Autocomplete/presentation';
import { getCachedTagColor, useTagColors } from '@/utils/tagColors';

import { genTagType } from '../utils';
import { useStyles } from './style';

export interface TagItem {
  className?: string;
  id: string;
  text: string;
}

export type PromptType = 'positive' | 'negative';

// @ts-ignore
const ReactTags: FC<any> = WithContext;

const KeyCodes = {
  comma: 188,
  enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

interface TagListProps {
  setTags: (tags: TagItem[]) => void;
  setValue: (tags: TagItem[]) => void;
  tags: TagItem[];
  type: PromptType;
}

const TagList = memo<TagListProps>(({ tags, setTags, type, setValue }) => {
  const id = `${type}_tag_editor`;
  const { styles } = useStyles(type);
  const { isDarkMode } = useThemeMode();
  const wrapRef = useRef<HTMLDivElement>(null);
  const tagTexts = useMemo(() => tags.map((tag) => tag.text), [tags]);
  const colorVersion = useTagColors(tagTexts, isDarkMode);
  const handleDelete = useCallback(
    (index_: number) => {
      const newTags = tags.filter((tag, index) => index !== index_);
      setTags(newTags);
      setValue(newTags);
    },
    [tags, setTags, setValue],
  );

  const handleAddition = useCallback(
    (tag: TagItem) => {
      const newTags = [...tags, genTagType(tag)];
      setTags(newTags);
      setValue(newTags);
    },
    [tags, setTags, setValue],
  );

  const handleDrag = useCallback(
    (tag: TagItem, currentPos: number, newPos: number) => {
      const newTags = [...tags];
      newTags.splice(currentPos, 1);
      newTags.splice(newPos, 0, genTagType(tag));
      setTags(newTags);
      setValue(newTags);
    },
    [tags, setTags, setValue],
  );

  const handleTagUpdate = useCallback(
    (index: number, tag: TagItem) => {
      const newTags = [...tags];
      newTags[index] = genTagType(tag);
      setTags(newTags);
      setValue(newTags);
    },
    [tags, setTags, setValue],
  );

  useEffect(() => {
    let attempts = 0;
    const bind = () => {
      const input = document.querySelector<HTMLInputElement>(`#${id}`);
      if (input) {
        try {
          attachAutocompleteArea(input);
        } catch (error) {
          consola.warn('Tag autocomplete failed', error);
        }
        return input.classList.contains('autocomplete');
      }
      return false;
    };
    if (bind()) return;
    const interval = setInterval(() => {
      if (bind() || ++attempts >= 10) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    const host = wrapRef.current;
    if (!host) return;
    const pills = host.querySelectorAll<HTMLElement>('span.ReactTags__tag');
    pills.forEach((pill, index) => {
      const tag = tags[index];
      if (!tag || tag.className) {
        pill.style.removeProperty('color');
        pill.style.removeProperty('border-color');
        return;
      }
      const color = getCachedTagColor(tag.text, isDarkMode);
      if (color) {
        pill.style.color = color;
        pill.style.borderColor = `color-mix(in srgb, ${color} 40%, transparent)`;
      } else {
        pill.style.removeProperty('color');
        pill.style.removeProperty('border-color');
      }
    });
  }, [tags, isDarkMode, colorVersion]);

  return (
    <div className={styles} ref={wrapRef}>
      <ReactTags
        delimiters={delimiters}
        editable
        handleAddition={handleAddition}
        handleDelete={handleDelete}
        handleDrag={handleDrag}
        id={id}
        inline
        inputFieldPosition="bottom"
        onTagUpdate={handleTagUpdate}
        tags={tags}
      />
    </div>
  );
});

export default TagList;
