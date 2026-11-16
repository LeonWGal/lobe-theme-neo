import type { SelectProps } from 'antd';

import type { NeutralColor, PrimaryColor } from '@/features/Setting/data';
import { DEFAULT_LOCALE_OPTIONS, DEFAULT_VERSION } from '@/store/api';
import type { I18n } from '@/types';

export interface WebuiSetting {
  accordionMode: 'free' | 'single';
  aspectRatioMode: 'dropdown' | 'buttons';
  autocompleteAnimaArtistPrefix: 'Off' | 'Auto';
  autocompleteAppendComma: boolean;
  autocompleteAppendSpace: boolean;
  autocompleteChantFile: string;
  autocompleteDelayTime: number;
  autocompleteDictionary: string;
  autocompleteDimUsedTags: boolean;
  autocompleteEscapeParentheses: boolean;
  autocompleteExtraAddMode: 'Insert after' | 'Insert before';
  autocompleteExtraFiles: string[];
  autocompleteFormatMode: 'Off' | 'Manual (Alt+Shift+F)' | 'Automatic (on blur)';
  autocompleteFrequencySort: boolean;
  autocompleteHistory: 'inherit' | 'on' | 'off';
  autocompleteLimit: number;
  autocompleteLoraArchFilter: 'Off' | 'Hide other architectures' | 'Show matching first';
  autocompleteMode: 'lobe' | 'classic' | 'off';
  autocompleteModelKeywordCompletion: 'Never' | 'Only user list' | 'Always';
  autocompleteModelKeywordLocation: 'Start of prompt' | 'End of prompt' | 'Before LORA' | 'After LORA';
  autocompleteNegative: 'inherit' | 'on' | 'off';
  autocompletePlacement: 'field' | 'caret';
  autocompleteReplaceUnderscores: boolean;
  autocompleteSelectUsedTag: boolean;
  autocompleteUseWildcards: boolean;
  bootSplashMode: 'random' | 'custom' | 'single' | 'off';
  bootSplashScene: string;
  bootSplashScenes: string;
  confirmPageUnload: boolean;
  density: 'comfortable' | 'compact';
  enableAspectRatio: boolean;
  enableCommandPalette: boolean;
  enableExtraNetworkSidebar: boolean;
  enableHighlight: boolean;
  enableHistory: boolean;
  enableImageInfo: boolean;
  enableLoraTools: boolean;
  enableMemoryKeeper: boolean;
  enablePresets: boolean;
  enableSidebar: boolean;
  enableSystemMonitor: boolean;
  enableWebFont: boolean;
  enableWorkbench: boolean;
  enhanceSampling: boolean;
  extraNetworkCardSize: number;
  extraNetworkFixedMode: 'fixed' | 'float';
  extraNetworkSidebarExpand: boolean;
  extraNetworkSidebarWidth: number;
  fontFamily: 'harmony' | 'inter' | 'geist' | 'system';
  fontMono: 'hack' | 'geistMono' | 'system';
  hideTipoPrompt: boolean;
  highlightKeywords: boolean;
  highlightModels: boolean;
  highlightTagColors: boolean;
  highlightWeights: boolean;
  highlightWildcards: boolean;
  i18n: I18n;
  layoutHideFooter: boolean;
  layoutSplitPreview: boolean;
  liteAnimation: boolean;
  logoCustomTitle: string | undefined;
  logoCustomUrl: string | undefined;
  logoType: 'lobe' | 'kitchen' | 'custom';
  neutralColor: NeutralColor | undefined;
  primaryColor: PrimaryColor | undefined;
  promptEditor: boolean;
  promptSections: boolean;
  promptTextareaType: 'scroll' | 'resizable';
  resolutionPresetsSD15: boolean;
  resolutionPresetsSD2: boolean;
  resolutionPresetsWan: boolean;
  resolutionPresetsXL: boolean;
  safetensorsPread: boolean;
  sidebarExpand: boolean;
  sidebarFixedMode: 'fixed' | 'float';
  sidebarWidth: number;
  studioHideSettingsByDefault: boolean;
  svgIcon: boolean;
  themeAppearance: 'auto' | 'light' | 'dark';
  themeBrightness: number;
  workspaceLayout: string;
}

export type WebuiSettingKeys = keyof WebuiSetting;

export const DEFAULT_SETTING: WebuiSetting = {
  accordionMode: 'free',
  aspectRatioMode: 'dropdown',
  autocompleteAnimaArtistPrefix: 'Auto',
  autocompleteAppendComma: true,
  autocompleteAppendSpace: true,
  autocompleteChantFile: '',
  autocompleteDelayTime: 100,
  autocompleteDictionary: '',
  autocompleteDimUsedTags: true,
  autocompleteEscapeParentheses: true,
  autocompleteExtraAddMode: 'Insert after',
  autocompleteExtraFiles: [],
  autocompleteFormatMode: 'Off',
  autocompleteFrequencySort: true,
  autocompleteHistory: 'inherit',
  autocompleteLimit: 20,
  autocompleteLoraArchFilter: 'Show matching first',
  autocompleteMode: 'lobe',
  autocompleteModelKeywordCompletion: 'Only user list',
  autocompleteModelKeywordLocation: 'Start of prompt',
  autocompleteNegative: 'inherit',
  autocompletePlacement: 'field',
  autocompleteReplaceUnderscores: true,
  autocompleteSelectUsedTag: true,
  autocompleteUseWildcards: true,
  bootSplashMode: 'random',
  bootSplashScene: 'glow',
  bootSplashScenes: 'glow,12,13,11,5,1,20,21,22,34,37,42,49',
  confirmPageUnload: false,
  density: 'comfortable',
  enableAspectRatio: true,
  enableCommandPalette: true,
  enableExtraNetworkSidebar: true,
  enableHighlight: true,
  enableHistory: true,
  enableImageInfo: true,
  enableLoraTools: true,
  enableMemoryKeeper: true,
  enablePresets: true,
  enableSidebar: true,
  enableSystemMonitor: true,
  enableWebFont: true,
  enableWorkbench: true,
  enhanceSampling: true,
  extraNetworkCardSize: 112,
  extraNetworkFixedMode: 'fixed',
  extraNetworkSidebarExpand: true,
  extraNetworkSidebarWidth: 340,
  fontFamily: 'harmony',
  fontMono: 'hack',
  hideTipoPrompt: false,
  highlightKeywords: true,
  highlightModels: true,
  highlightTagColors: true,
  highlightWeights: true,
  highlightWildcards: true,
  i18n: 'en_US',
  layoutHideFooter: false,
  layoutSplitPreview: false,
  liteAnimation: true,
  logoCustomTitle: '',
  logoCustomUrl: '',
  logoType: 'lobe',
  neutralColor: undefined,
  primaryColor: undefined,
  promptEditor: false,
  promptSections: true,
  promptTextareaType: 'resizable',
  resolutionPresetsSD15: false,
  resolutionPresetsSD2: false,
  resolutionPresetsWan: false,
  resolutionPresetsXL: true,
  safetensorsPread: true,
  sidebarExpand: true,
  sidebarFixedMode: 'fixed',
  sidebarWidth: 280,
  studioHideSettingsByDefault: true,
  svgIcon: true,
  themeAppearance: 'auto',
  themeBrightness: 0,
  workspaceLayout: '',
};

export interface StroeState {
  currentTab: string;
  isForgeNeo: boolean;
  latestVersion: string;
  loading: boolean;
  localeOptions: SelectProps['options'];
  /** Mobile: only one sidebar open at a time */
  mobileSidebar: 'none' | 'quick' | 'extra';
  setting: WebuiSetting;
  themeMode: 'light' | 'dark';
  version: string;
}

export const initialState: StroeState = {
  currentTab: 'tab_txt2img',
  isForgeNeo: false,
  latestVersion: DEFAULT_VERSION,
  loading: true,
  localeOptions: DEFAULT_LOCALE_OPTIONS,
  mobileSidebar: 'none',
  setting: DEFAULT_SETTING,
  themeMode: 'dark',
  version: DEFAULT_VERSION,
};
