import { ACCENT_COLORS, CUSTOM_NEUTRALS } from '@/styles/themeColors';

export const primaryColors = ACCENT_COLORS;

export const primaryColorsSwatches = Object.values(primaryColors).map((color) => ({ color }));

export const neutralColors = Object.fromEntries(
  Object.entries(CUSTOM_NEUTRALS).map(([id, spec]) => [id, spec.dark.colorNeutral]),
) as Record<keyof typeof CUSTOM_NEUTRALS, string>;

export const neutralColorsSwatches = Object.values(neutralColors).map((color) => ({ color }));

export const findCustomThemeName = (type: 'primary' | 'neutral', value?: string): any => {
  if (!value) return '';
  const target = value.toLowerCase();
  const res = type === 'primary' ? primaryColors : neutralColors;
  const result = Object.entries(res).find((item) => item[1].toLowerCase() === target);
  return result?.[0];
};

export type PrimaryColor = keyof typeof primaryColors;

export type NeutralColor = keyof typeof neutralColors;

export const BOOT_SCENES = [
  { id: 'glow', label: 'Glow Horizon' },
  { id: '12', label: 'Chromatic Lens' },
  { id: '13', label: 'Fluted Folds' },
  { id: '11', label: 'Frosted Panels' },
  { id: '5', label: 'Fluted Glass' },
  { id: '1', label: 'Ride the Wave × Colorful Wave' },
  { id: '20', label: 'Aurora Ribbons' },
  { id: '21', label: 'Black Hole · VGPU' },
  { id: '22', label: 'Etched Accretion' },
  { id: '34', label: 'Infinite Plane' },
  { id: '37', label: 'Liquid Crystal' },
  { id: '42', label: 'Cosmic Ocean' },
  { id: '49', label: 'Neuro Noise' },
] as const;
