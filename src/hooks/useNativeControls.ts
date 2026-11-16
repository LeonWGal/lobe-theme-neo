import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { enhanceSourceTabs, galleryFeedback, labelNativeControls } from '@/utils/nativeControls';

export const useNativeControls = () => {
  const { t } = useTranslation();
  useEffect(() => {
    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    const labels = {
      emptyGallery: t('controls.emptyGallery'),
      openFolder: t('controls.openFolder'),
      pasteParameters: t('controls.pasteParameters'),
      randomSeed: t('controls.randomSeed'),
      randomVariationSeed: t('controls.randomVariationSeed'),
      reuseSeed: t('controls.reuseSeed'),
      reuseVariationSeed: t('controls.reuseVariationSeed'),
      saveArchive: t('controls.saveArchive'),
      saveImage: t('controls.saveImage'),
      sendToExtras: t('controls.sendToExtras'),
      sendToImg2img: t('controls.sendToImg2img'),
      sendToInpaint: t('controls.sendToInpaint'),
      upscale: t('controls.upscale'),
    };
    const cleanupLabels = labelNativeControls(root, labels);
    const cleanupGalleries = galleryFeedback(root, labels.emptyGallery);
    const cleanupSourceTabs = enhanceSourceTabs(root, {
      extrasSource: t('controls.extrasSource'),
      pngNoParameters: t('controls.pngNoParameters'),
      pngSource: t('controls.pngSource'),
    });
    return () => {
      cleanupSourceTabs();
      cleanupLabels();
      cleanupGalleries();
    };
  }, [t]);
};
