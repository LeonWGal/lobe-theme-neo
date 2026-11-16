import { type FC, type SVGProps, createElement } from 'react';
import { outlineStrokeWidth } from './tablerPaths';

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };
export type TablerIcon = FC<IconProps>;

// The body comes exclusively from the bundled Tabler paths.
export const outline = (body: string): TablerIcon =>
  function TablerOutline({ size = 24, ...props }) {
    return createElement('svg', {
      'aria-hidden': true,
      dangerouslySetInnerHTML: { __html: body },
      fill: 'none',
      focusable: false,
      height: size,
      stroke: 'currentColor',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: outlineStrokeWidth,
      viewBox: '0 0 24 24',
      width: size,
      ...props,
    });
  };
