import { Converter } from '@/scripts/formatPrompt';

import { TagItem } from './TagList';

export const genTagType = (tag: TagItem): TagItem => {
  const newTag = { ...tag };
  if (newTag.text.includes('<lora')) {
    newTag.className = 'ReactTags__lora';
  } else if (newTag.text.includes('<hypernet')) {
    newTag.className = 'ReactTags__hypernet';
  } else if (newTag.text.includes('<embedding')) {
    newTag.className = 'ReactTags__embedding';
  } else {
    newTag.className = undefined;
  }
  return newTag;
};

export const formatPrompt = (value: string) => {
  return Converter.convertStr2Array(value).map((tag, index) =>
    genTagType({ id: `${index}:${tag}`, text: tag }),
  );
};
