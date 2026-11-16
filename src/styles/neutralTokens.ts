import { createLobeToken } from '@lobehub/ui';
import { mix } from 'polished';

import type { WebuiSetting } from '@/store';
import { getReadableAccent, getReadableForeground } from '@/utils/colorContrast';

import {
  CUSTOM_NEUTRALS,
  type NeutralThemeId,
  adjustSurfaceBrightness,
} from './themeColors';

export const getNeutralTokens = (
  appearance: 'dark' | 'light',
  neutralColor: WebuiSetting['neutralColor'],
  themeBrightness = 0,
) => {
  const base = createLobeToken({ appearance });
  const custom = neutralColor
    ? CUSTOM_NEUTRALS[neutralColor as NeutralThemeId]?.[appearance]
    : undefined;
  const rawSurfaces = {
    colorBgContainer: custom?.colorBgContainer ?? base.colorBgContainer,
    colorBgElevated: custom?.colorBgElevated ?? base.colorBgElevated,
    colorBgLayout: custom?.colorBgLayout ?? base.colorBgLayout,
    colorBgSpotlight: custom?.colorBgSpotlight ?? base.colorBgSpotlight,
    colorBorder: custom?.colorBorder ?? base.colorBorder,
    colorBorderSecondary: custom?.colorBorderSecondary ?? base.colorBorderSecondary,
  };
  const surfaces = adjustSurfaceBrightness(rawSurfaces, appearance, themeBrightness);
  const contrastBase = appearance === 'dark' ? surfaces.colorBgElevated : surfaces.colorBgLayout;
  const foreground = getReadableForeground(contrastBase);
  const readable = getReadableAccent(mix(0.72, foreground, contrastBase), contrastBase);
  const muted = getReadableAccent(mix(0.65, foreground, contrastBase), contrastBase);
  const tertiary = getReadableAccent(mix(0.68, foreground, contrastBase), contrastBase);

  return {
    ...surfaces,
    ...('colorBgMask' in base ? { colorBgMask: base.colorBgMask } : {}),
    colorFill: base.colorFill,
    colorFillQuaternary: base.colorFillQuaternary,
    colorFillSecondary: base.colorFillSecondary,
    colorFillTertiary: base.colorFillTertiary,
    colorText: mix(0.9, foreground, contrastBase),
    colorTextDescription: readable,
    colorTextHeading: foreground,
    colorTextLabel: readable,
    colorTextPlaceholder: muted,
    colorTextQuaternary: base.colorTextQuaternary,
    colorTextSecondary: readable,
    colorTextTertiary: tertiary,
  };
};
