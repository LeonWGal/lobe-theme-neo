import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { enhanceImageViewer } from '@/utils/imageViewer';
import { enhanceLiveGenerationViewer } from '@/utils/liveGenerationViewer';

export const useImageViewer = () => {
  const { t } = useTranslation();
  useEffect(() => enhanceLiveGenerationViewer(document, {
    close: t('gallery.close'),
    ended: t('gallery.liveEnded'),
    live: t('gallery.liveGeneration'),
    open: t('gallery.openLive'),
  }), [t]);
  useEffect(
    () =>
      enhanceImageViewer(document, {
        '.modalClose': t('gallery.close'),
        '.modalNext': t('gallery.next'),
        '.modalPrev': t('gallery.previous'),
        '.modalSave': t('gallery.save'),
        '.modalTileImage': t('gallery.tile'),
        '.modalToggleLivePreview': t('gallery.live'),
        '.modalZoom': t('gallery.zoom'),
        'viewer': t('gallery.viewer'),
      }),
    [t],
  );
};
