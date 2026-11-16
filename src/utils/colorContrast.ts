import { getContrast, mix } from 'polished';

export const getReadableForeground = (background: string) =>
  getContrast(background, '#ffffff') >= getContrast(background, '#000000') ? '#ffffff' : '#000000';

/** Preserve the chosen accent hue while making small labels readable on a surface. */
export const getReadableAccent = (accent: string, background: string, minimum = 4.5) => {
  if (getContrast(accent, background) >= minimum) return accent;
  const foreground = getReadableForeground(background);
  for (let step = 1; step <= 20; step++) {
    const candidate = mix(step / 20, foreground, accent);
    if (getContrast(candidate, background) >= minimum) return candidate;
  }
  return foreground;
};
