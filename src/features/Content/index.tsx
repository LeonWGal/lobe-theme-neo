import isEqual from 'fast-deep-equal';
import { memo, useRef } from 'react';

import { useImageViewer } from '@/hooks/useImageViewer';
import { useInject } from '@/hooks/useInject';
import { useOverlaySidebars } from '@/hooks/useOverlaySidebars';
import { readWorkspace, resolveWorkbenchLayout } from '@/features/Workspace/model';
import { selectors, useAppStore } from '@/store';
import { type DivProps } from '@/types';

import PromptWorkbench from '@/features/PromptWorkbench';

import SplitView from './SplitView';
import { removePromptScrollHide } from './removePromptScrollHide';
import { useStyles } from './style';

const Content = memo<DivProps>(({ className, ...props }) => {
  const mainReference = useRef<HTMLDivElement>(null);
  const { compact } = useOverlaySidebars();
  useImageViewer();
  const setting = useAppStore(selectors.currentSetting, isEqual);
  const { layout } = readWorkspace(setting.workspaceLayout);
  const splitFor = (tab: 'txt2img' | 'img2img') => {
    const placement = layout[tab]?.placement;
    if (placement === 'threeCol' || placement === 'threeColPreviewLeft') return true;
    if (placement === 'studio') return false;
    return layout[tab]?.splitPreview ?? setting.layoutSplitPreview;
  };
  const mode = (tab: 'txt2img' | 'img2img') => {
    const placement = layout[tab]?.placement;
    if (placement === 'threeCol' || placement === 'threeColPreviewLeft' || placement === 'studio') {
      return placement;
    }
    const split = splitFor(tab);
    return placement === 'stacked' ? (split ? 'stackedSplit' : 'stacked') : split ? 'split' : 'off';
  };
  const workbenchFor = (tab: 'txt2img' | 'img2img') => resolveWorkbenchLayout(splitFor(tab));
  const { cx, styles } = useStyles({
    isPromptResizable: setting.promptTextareaType === 'resizable',
  });

  useInject(mainReference, '.app', {
    debug: '[layout] inject - Content',
    onSuccess: () => {
      removePromptScrollHide();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (mainReference.current?.querySelector('.app')) window.dispatchEvent(new Event('lobe:ready'));
      }));
    },
  });

  return (
    <>
      <div
        className={cx(
          styles.container,
          styles.textares,
          styles.txt2img,
          styles.splitView,
          className,
        )}
        ref={mainReference}
        {...props}
      />

      <SplitView
        extras={setting.layoutSplitPreview && !compact}
        img2img={mode('img2img')}
        txt2img={mode('txt2img')}
        workbenchImg2img={workbenchFor('img2img')}
        workbenchTxt2img={workbenchFor('txt2img')}
      />
      {setting.enableWorkbench && <PromptWorkbench />}
    </>
  );
});

export default Content;
