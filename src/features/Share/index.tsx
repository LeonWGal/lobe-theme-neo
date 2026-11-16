import { Suspense, lazy, memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useInject } from '@/hooks/useInject';

import { createButton } from './createButton';

const ShareModal = lazy(() => import('./ShareModal'));

const Share = memo<{ type: 'txt' | 'img' }>(({ type }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const buttonReference = useRef<any>(null);
  if (!buttonReference.current) buttonReference.current = createButton(type, setOpen);
  useEffect(() => {
    buttonReference.current.title = t('share');
    buttonReference.current.setAttribute('aria-label', t('share'));
  }, [t]);

  useInject(buttonReference, `#image_buttons_${type}2img, #image_buttons_${type}2img > .form`, {
    debug: `[layout] inject - Share ${type}`,
    inverse: true,
  });

  return open ? (
    <Suspense fallback={null}>
      <ShareModal onCancel={() => setOpen(false)} open type={type} />
    </Suspense>
  ) : null;
});

export default memo(() => {
  return (
    <>
      <Share type={'txt'} />
      <Share type={'img'} />
    </>
  );
});
