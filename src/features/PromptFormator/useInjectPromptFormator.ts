import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useInject } from '@/hooks/useInject';

import { createButton } from './createButton';

export const useInjectPromptFormator = (type: 'txt' | 'img') => {
  const ref = useRef<any>(null);
  const { t } = useTranslation();
  if (!ref.current) ref.current = createButton(type);
  useEffect(() => {
    const [format, undo] = ref.current.querySelectorAll('button');
    format.title = t('prompt.formatPreview');
    format.setAttribute('aria-label', format.title);
    undo.title = t('prompt.undo');
    undo.setAttribute('aria-label', undo.title);
  }, [t]);
  useInject(ref, `#${type}2img_tools, #${type}2img_tools > div.form`, {
    inverse: true,
  });
};
