import { generateColorPalette } from '@lobehub/ui';
import { colorScales } from '@lobehub/ui/color';
import { mix } from 'polished';

import { kitchenPrimary } from './kitchenColors';

/* eslint-disable sort-keys-fix/sort-keys-fix -- Accent order drives the visual swatch rainbow */
export const ACCENT_COLORS = {
  crimson: '#ef4444',
  red: '#f4416c',
  coral: '#fb7185',
  volcano: '#ec5e41',
  orange: '#ff9927',
  bronze: '#b4693e',
  gold: '#ffb224',
  yellow: '#ffef5c',
  lime: '#c4f042',
  green: '#62c473',
  emerald: '#059669',
  teal: '#14b8a6',
  cyan: '#95f3d9',
  aqua: '#06b6d4',
  sky: '#38bdf8',
  kitchen: kitchenPrimary.dark.colorPrimary,
  royal: '#1e40af',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  lavender: '#c4b5fd',
  purple: '#bd54c6',
  magenta: '#e34ba9',
  plum: '#9d174d',
  mono: '#71717a',
} as const;
/* eslint-enable sort-keys-fix/sort-keys-fix */

export type AccentColorId = keyof typeof ACCENT_COLORS;

export const NEUTRAL_THEME_IDS = [
  '',
  'oled',
  'kitchen',
  'zinc',
  'slate',
  'nord',
  'twilight',
  'mauve',
  'rosewood',
  'espresso',
  'sand',
  'sage',
] as const;

export type NeutralThemeId = Exclude<(typeof NEUTRAL_THEME_IDS)[number], ''>;

export interface CustomNeutralSpec {
  dark: {
    colorBgContainer: string;
    colorBgElevated: string;
    colorBgLayout: string;
    colorBgSpotlight: string;
    colorBorder: string;
    colorBorderSecondary: string;
    colorNeutral: string;
  };
  light: {
    colorBgContainer: string;
    colorBgElevated: string;
    colorBgLayout: string;
    colorBgSpotlight: string;
    colorBorder: string;
    colorBorderSecondary: string;
    colorNeutral: string;
  };
}

export const CUSTOM_NEUTRALS: Record<NeutralThemeId, CustomNeutralSpec> = {
  espresso: {
    dark: {
      colorBgContainer: '#271a14',
      colorBgElevated: '#2e2019',
      colorBgLayout: '#1c120e',
      colorBgSpotlight: '#442e24',
      colorBorder: '#3f2c23',
      colorBorderSecondary: '#31211a',
      colorNeutral: '#7c5d4e',
    },
    light: {
      colorBgContainer: '#fdfaf7',
      colorBgElevated: '#ffffff',
      colorBgLayout: '#f7f1ec',
      colorBgSpotlight: '#453026',
      colorBorder: '#dfd1c5',
      colorBorderSecondary: '#ede3da',
      colorNeutral: '#7c5d4e',
    },
  },
  kitchen: {
    dark: {
      colorBgContainer: '#1f1f1f',
      colorBgElevated: '#242424',
      colorBgLayout: '#181818',
      colorBgSpotlight: '#444444',
      colorBorder: '#444444',
      colorBorderSecondary: '#333333',
      colorNeutral: '#666666',
    },
    light: {
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBgLayout: '#f7f7f7',
      colorBgSpotlight: '#262626',
      colorBorder: '#dddddd',
      colorBorderSecondary: '#eeeeee',
      colorNeutral: '#666666',
    },
  },
  mauve: {
    dark: {
      colorBgContainer: '#241c2b',
      colorBgElevated: '#2b2234',
      colorBgLayout: '#1a1420',
      colorBgSpotlight: '#3f324b',
      colorBorder: '#3b2e47',
      colorBorderSecondary: '#2d2336',
      colorNeutral: '#736580',
    },
    light: {
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBgLayout: '#f6f2f9',
      colorBgSpotlight: '#453752',
      colorBorder: '#dfd5e8',
      colorBorderSecondary: '#ece5f2',
      colorNeutral: '#736580',
    },
  },
  nord: {
    dark: {
      colorBgContainer: '#263042',
      colorBgElevated: '#2d394e',
      colorBgLayout: '#1d2534',
      colorBgSpotlight: '#3b4861',
      colorBorder: '#3b4861',
      colorBorderSecondary: '#2f3a4f',
      colorNeutral: '#6c7c99',
    },
    light: {
      colorBgContainer: '#f8fafc',
      colorBgElevated: '#ffffff',
      colorBgLayout: '#eceff4',
      colorBgSpotlight: '#2e3440',
      colorBorder: '#d2dae6',
      colorBorderSecondary: '#e2e8f0',
      colorNeutral: '#6c7c99',
    },
  },
  oled: {
    dark: {
      colorBgContainer: '#08080a',
      colorBgElevated: '#101014',
      colorBgLayout: '#000000',
      colorBgSpotlight: '#18181c',
      colorBorder: '#24242b',
      colorBorderSecondary: '#18181d',
      colorNeutral: '#52525b',
    },
    light: {
      colorBgContainer: '#fafafa',
      colorBgElevated: '#ffffff',
      colorBgLayout: '#f2f2f3',
      colorBgSpotlight: '#18181b',
      colorBorder: '#dcdce0',
      colorBorderSecondary: '#e9e9ec',
      colorNeutral: '#52525b',
    },
  },
  rosewood: {
    dark: {
      colorBgContainer: '#2a1820',
      colorBgElevated: '#321e27',
      colorBgLayout: '#1e1117',
      colorBgSpotlight: '#482a37',
      colorBorder: '#432733',
      colorBorderSecondary: '#341e28',
      colorNeutral: '#85586c',
    },
    light: {
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBgLayout: '#faf2f5',
      colorBgSpotlight: '#4d2b39',
      colorBorder: '#e8d0da',
      colorBorderSecondary: '#f2e2e9',
      colorNeutral: '#85586c',
    },
  },
  sage: {
    dark: {
      colorBgContainer: '#16231e',
      colorBgElevated: '#1c2c26',
      colorBgLayout: '#0f1915',
      colorBgSpotlight: '#2a4138',
      colorBorder: '#293e36',
      colorBorderSecondary: '#1e2f29',
      colorNeutral: '#5c786d',
    },
    light: {
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBgLayout: '#f0f6f4',
      colorBgSpotlight: '#2b453b',
      colorBorder: '#cfe0d9',
      colorBorderSecondary: '#e0ece7',
      colorNeutral: '#5c786d',
    },
  },
  sand: {
    dark: {
      colorBgContainer: '#25231b',
      colorBgElevated: '#2c2a21',
      colorBgLayout: '#1b1913',
      colorBgSpotlight: '#413d2f',
      colorBorder: '#3c382b',
      colorBorderSecondary: '#2e2b21',
      colorNeutral: '#7a745f',
    },
    light: {
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBgLayout: '#f7f5ee',
      colorBgSpotlight: '#4a4536',
      colorBorder: '#e2dccb',
      colorBorderSecondary: '#ede9dd',
      colorNeutral: '#7a745f',
    },
  },
  slate: {
    dark: {
      colorBgContainer: '#161c28',
      colorBgElevated: '#1d2433',
      colorBgLayout: '#0f131c',
      colorBgSpotlight: '#2d374c',
      colorBorder: '#2c364b',
      colorBorderSecondary: '#202838',
      colorNeutral: '#647087',
    },
    light: {
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBgLayout: '#f1f4f9',
      colorBgSpotlight: '#334155',
      colorBorder: '#d4dce9',
      colorBorderSecondary: '#e4eaf2',
      colorNeutral: '#647087',
    },
  },
  twilight: {
    dark: {
      colorBgContainer: '#18152b',
      colorBgElevated: '#1f1b36',
      colorBgLayout: '#110f1f',
      colorBgSpotlight: '#2f2a52',
      colorBorder: '#2e294e',
      colorBorderSecondary: '#221e3b',
      colorNeutral: '#67608f',
    },
    light: {
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBgLayout: '#f2f1fa',
      colorBgSpotlight: '#2b274d',
      colorBorder: '#d7d3ef',
      colorBorderSecondary: '#e7e4f6',
      colorNeutral: '#67608f',
    },
  },
  zinc: {
    dark: {
      colorBgContainer: '#27272a',
      colorBgElevated: '#2e2e33',
      colorBgLayout: '#1e1e21',
      colorBgSpotlight: '#3f3f46',
      colorBorder: '#3c3c43',
      colorBorderSecondary: '#2f2f35',
      colorNeutral: '#71717a',
    },
    light: {
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBgLayout: '#f4f4f5',
      colorBgSpotlight: '#27272a',
      colorBorder: '#d4d4d8',
      colorBorderSecondary: '#e4e4e7',
      colorNeutral: '#71717a',
    },
  },
};

const parseRgb = (color: string): [number, number, number] => {
  const hex = color.trim();
  if (hex.startsWith('#')) {
    const full = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
    const n = Number.parseInt(full.slice(1, 7), 16);
    if (!Number.isNaN(n)) return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const match = color.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  if (match) return [Number(match[1]), Number(match[2]), Number(match[3])];
  return [24, 24, 27];
};

const labInv = (t: number) => (t * t * t > 0.008_856 ? t * t * t : (t - 16 / 116) / 7.787);

const labComp = (u: number) => {
  const c = u <= 0.003_130_8 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(1, c)) * 255);
};

const rgbToLab = ([r, g, b]: [number, number, number]): [number, number, number] => {
  const [R, G, B] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.040_45 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  let x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.950_47;
  let y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  let z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.088_83;
  [x, y, z] = [x, y, z].map((t) => (t > 0.008_856 ? Math.cbrt(t) : 7.787 * t + 16 / 116));
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};

const labToHex = ([L, a, b]: [number, number, number]): string => {
  const y = (L + 16) / 116;
  const x = a / 500 + y;
  const z = y - b / 200;
  const X = labInv(x) * 0.950_47;
  const Y = labInv(y);
  const Z = labInv(z) * 1.088_83;
  const r = labComp(X * 3.2406 + Y * -1.5372 + Z * -0.4986);
  const g = labComp(X * -0.9689 + Y * 1.8758 + Z * 0.0415);
  const bl = labComp(X * 0.0557 + Y * -0.204 + Z * 1.057);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

/**
 * Adjusts theme lightness (-30..+30) in CIELAB L* while preserving the minimum
 * perceptual ΔL* gaps between layout, card, elevated, border, and spotlight.
 */
export const adjustSurfaceBrightness = (
  surfaces: {
    colorBgContainer: string;
    colorBgElevated: string;
    colorBgLayout: string;
    colorBgSpotlight: string;
    colorBorder: string;
    colorBorderSecondary: string;
  },
  appearance: 'dark' | 'light',
  brightness = 0,
) => {
  if (!brightness) return surfaces;
  const clamped = Math.max(-30, Math.min(30, brightness));
  const dL = clamped * 0.45;

  const lLayout = rgbToLab(parseRgb(surfaces.colorBgLayout));
  const lContainer = rgbToLab(parseRgb(surfaces.colorBgContainer));
  const lElevated = rgbToLab(parseRgb(surfaces.colorBgElevated));
  const lBorder = rgbToLab(parseRgb(surfaces.colorBorder));
  const lBorderSec = rgbToLab(parseRgb(surfaces.colorBorderSecondary));
  const lSpot = rgbToLab(parseRgb(surfaces.colorBgSpotlight));

  const baseGap = Math.max(5.5, Math.abs(lContainer[0] - lLayout[0]));
  const elevGap = Math.max(2.5, Math.abs(lElevated[0] - lContainer[0]));
  const borderGap = Math.max(7, Math.abs(lBorder[0] - lContainer[0]));
  const borderSecGap = Math.max(4, Math.abs(lBorderSec[0] - lContainer[0]));
  const spotGap = Math.max(12, Math.abs(lSpot[0] - lContainer[0]));

  if (appearance === 'dark') {
    const nextLayoutL = Math.max(0, Math.min(26, lLayout[0] + dL));
    const nextContainerL = Math.max(nextLayoutL + baseGap, lContainer[0] + dL);
    const nextElevatedL = Math.max(nextContainerL + elevGap, lElevated[0] + dL);
    const nextBorderL = Math.max(nextContainerL + borderGap, lBorder[0] + dL);
    const nextBorderSecL = Math.max(nextContainerL + borderSecGap, lBorderSec[0] + dL);
    const nextSpotL = Math.max(nextContainerL + spotGap, lSpot[0] + dL);
    const scaleC = (origL: number, nextL: number) => (origL > 1 ? Math.min(1.15, nextL / origL) : 1);
    const cScale = scaleC(lLayout[0], nextLayoutL);
    return {
      colorBgContainer: labToHex([nextContainerL, lContainer[1], lContainer[2]]),
      colorBgElevated: labToHex([nextElevatedL, lElevated[1], lElevated[2]]),
      colorBgLayout: labToHex([nextLayoutL, lLayout[1] * cScale, lLayout[2] * cScale]),
      colorBgSpotlight: labToHex([nextSpotL, lSpot[1], lSpot[2]]),
      colorBorder: labToHex([nextBorderL, lBorder[1], lBorder[2]]),
      colorBorderSecondary: labToHex([nextBorderSecL, lBorderSec[1], lBorderSec[2]]),
    };
  }

  const nextContainerL = Math.min(100, Math.max(78, lContainer[0] + dL));
  const nextElevatedL = Math.min(100, Math.max(nextContainerL, lElevated[0] + dL));
  const nextLayoutL = Math.min(nextContainerL - baseGap, lLayout[0] + dL);
  const nextBorderL = Math.min(nextLayoutL - borderGap, lBorder[0] + dL);
  const nextBorderSecL = Math.min(nextLayoutL - borderSecGap, lBorderSec[0] + dL);
  const nextSpotL = Math.max(8, Math.min(60, lSpot[0] + dL * 0.6));
  return {
    colorBgContainer: labToHex([nextContainerL, lContainer[1], lContainer[2]]),
    colorBgElevated: labToHex([nextElevatedL, lElevated[1], lElevated[2]]),
    colorBgLayout: labToHex([nextLayoutL, lLayout[1], lLayout[2]]),
    colorBgSpotlight: labToHex([nextSpotL, lSpot[1], lSpot[2]]),
    colorBorder: labToHex([nextBorderL, lBorder[1], lBorder[2]]),
    colorBorderSecondary: labToHex([nextBorderSecL, lBorderSec[1], lBorderSec[2]]),
  };
};

export const getPrimaryTokens = (appearance: 'dark' | 'light', primaryColor?: string) => {
  if (!primaryColor) return {};
  if (primaryColor === 'kitchen') return kitchenPrimary[appearance];
  const scale = (colorScales as Record<string, any>)[primaryColor];
  if (scale) return generateColorPalette({ appearance, scale, type: 'Primary' });

  const hex = (ACCENT_COLORS as Record<string, string>)[primaryColor];
  if (!hex) return {};
  const baseBg = appearance === 'dark' ? '#141414' : '#ffffff';
  const shift = appearance === 'dark' ? '#ffffff' : '#000000';
  return {
    colorPrimary: hex,
    colorPrimaryActive: mix(0.22, '#000000', hex),
    colorPrimaryBg: mix(appearance === 'dark' ? 0.16 : 0.12, hex, baseBg),
    colorPrimaryBgHover: mix(appearance === 'dark' ? 0.24 : 0.2, hex, baseBg),
    colorPrimaryBorder: mix(appearance === 'dark' ? 0.36 : 0.35, hex, baseBg),
    colorPrimaryBorderHover: mix(appearance === 'dark' ? 0.48 : 0.5, hex, baseBg),
    colorPrimaryHover: mix(0.18, shift, hex),
    colorPrimaryText: mix(0.1, shift, hex),
    colorPrimaryTextActive: mix(0.2, '#000000', hex),
    colorPrimaryTextHover: mix(0.22, shift, hex),
  };
};
