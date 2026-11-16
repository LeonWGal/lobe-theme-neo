import { LayoutHeader, LayoutMain, LayoutSidebar } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useEffect } from 'react';

import StructuredData from '@/components/StructuredData';
import { connectAutocomplete } from '@/features/Autocomplete/presentation';
import PromptFormator from '@/features/PromptFormator';
import Tools from '@/features/Tools';
import { useWorkspace } from '@/features/Workspace/useWorkspace';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { useDropdownMenus } from '@/hooks/useDropdownMenus';
import { useNativeControls } from '@/hooks/useNativeControls';
import { useRangeProgress } from '@/hooks/useRangeProgress';
import '@/locales/config';
import i18next from 'i18next';
import replaceIcon from '@/scripts/replaceIcon';
import { selectors, useAppStore } from '@/store';
import GlobalStyle from '@/styles';
import { restorePromptsAfterReload } from '@/utils/promptReload';

import Content from '../features/Content';
import ExtraNetworkSidebar from '../features/ExtraNetworkSidebar';
import Footer from '../features/Footer';
import Header from '../features/Header';
import QuickSettingSidebar from '../features/QuickSettingSidebar';
import Share from '../features/Share';
import { useStyles } from './style';

export const HEADER_HEIGHT = 64;

const Index = memo(() => {
  const setting = useAppStore(selectors.currentSetting, isEqual);
  useBeforeUnload(setting.confirmPageUnload);
  useDropdownMenus();
  useRangeProgress();
  useNativeControls();
  useWorkspace();
  useEffect(() => {
    let disconnect: ReturnType<typeof connectAutocomplete>;
    const connect = () => {
      disconnect ??= connectAutocomplete(() => {
        const current = useAppStore.getState().setting;
        return {
          animaArtistPrefix: current.autocompleteAnimaArtistPrefix,
          appendComma: current.autocompleteAppendComma,
          appendSpace: current.autocompleteAppendSpace,
          chantFile: current.autocompleteChantFile,
          delayTime: current.autocompleteDelayTime,
          dictionary: current.autocompleteDictionary,
          dimUsedTags: current.autocompleteDimUsedTags,
          escapeParentheses: current.autocompleteEscapeParentheses,
          extraAddMode: current.autocompleteExtraAddMode,
          extraFiles: current.autocompleteExtraFiles,
          formatMode: current.autocompleteFormatMode,
          frequencySort: current.autocompleteFrequencySort,
          history: current.autocompleteHistory,
          limit: current.autocompleteLimit,
          loraArchFilter: current.autocompleteLoraArchFilter,
          mode: current.autocompleteMode,
          modelKeywordCompletion: current.autocompleteModelKeywordCompletion,
          modelKeywordLocation: current.autocompleteModelKeywordLocation,
          negative: current.autocompleteNegative,
          placement: current.autocompletePlacement,
          replaceUnderscores: current.autocompleteReplaceUnderscores,
          selectUsedTag: current.autocompleteSelectUsedTag,
          useWildcards: current.autocompleteUseWildcards,
        };
      }, () => i18next.t('autocomplete.loading'));
    };
    window.addEventListener('lobe:autocomplete-ready', connect);
    connect();
    return () => {
      window.removeEventListener('lobe:autocomplete-ready', connect);
      disconnect?.();
    };
  }, []);
  useEffect(restorePromptsAfterReload, []);
  useEffect(() => {
    document.documentElement.dataset.lobeLiteEffects = String(setting.liteAnimation);
    delete document.documentElement.dataset.lobeReducedMotion;
    return () => {
      delete document.documentElement.dataset.lobeLiteEffects;
    };
  }, [setting.liteAnimation]);
  const { cx, styles } = useStyles({
    headerHeight: HEADER_HEIGHT,
    isPrimaryColor: Boolean(setting.primaryColor),
  });

  useEffect(() => {
    if (!setting.enableHighlight) return;
    import('@/modules/PromptHighlight/page').then(({ default: PromptHighlight }) =>
      PromptHighlight(),
    );
  }, [setting.enableHighlight]);

  useEffect(() => {
    if (setting.enableImageInfo) {
      import('@/modules/ImageInfo/page').then(({ default: ImageInfo }) => ImageInfo());
    }
    const stopReplacingIcons = setting.svgIcon ? replaceIcon() : undefined;

    const handleDropdownWrapClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[id$="_script_container"]')) return;
      if (target.closest('ul.options, [role="listbox"], .token-remove, .remove-all')) return;
      const wrap = target.closest('.gradio-dropdown .wrap');
      if (wrap) {
        const input = wrap.querySelector<HTMLInputElement>('input');
        if (input && document.activeElement !== input) {
          input.focus();
        }
      }
    };
    document.addEventListener('click', handleDropdownWrapClick);
    return () => {
      stopReplacingIcons?.();
      document.removeEventListener('click', handleDropdownWrapClick);
    };
  }, []);

  return (
    <>
      <StructuredData />
      <GlobalStyle />
      <LayoutHeader className="lobe-app-header" headerHeight={HEADER_HEIGHT}>
        <Header />
      </LayoutHeader>
      <LayoutMain className={cx("lobe-app-main", styles.workspace)}>
        {setting.enableSidebar && (
          <LayoutSidebar
            className={cx(styles.sidebar, 'lobe-app-sidebar')}
            headerHeight={HEADER_HEIGHT}
            style={{ flex: 0, zIndex: 50 }}
          >
            <QuickSettingSidebar headerHeight={HEADER_HEIGHT} />
          </LayoutSidebar>
        )}
        <Content className={cx(!setting.enableSidebar && styles.quicksettings)} />
        <PromptFormator />
        <Tools />
        <Share />
        {setting.enableExtraNetworkSidebar && (
          <LayoutSidebar
            className={cx(styles.sidebar, 'lobe-app-sidebar')}
            headerHeight={HEADER_HEIGHT}
            style={{ flex: 0, zIndex: 50 }}
          >
            <ExtraNetworkSidebar headerHeight={HEADER_HEIGHT} />
          </LayoutSidebar>
        )}
      </LayoutMain>
      {!setting.layoutHideFooter && <Footer />}
    </>
  );
});

export default Index;
