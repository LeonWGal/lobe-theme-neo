import { useThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Fragment, memo, useMemo } from 'react';

import { useAppStore } from '@/store';
import { getCachedTagColor, useTagColors } from '@/utils/tagColors';

import { useStyles } from '../style';
import { highlightRuns, promptForeground } from './tokenize';

interface HighlightFlags {
  keywords: boolean;
  models: boolean;
  tagColors: boolean;
  weights: boolean;
  wildcards: boolean;
}

const isScopeEnabled = (scope: string | undefined, flags: HighlightFlags): boolean => {
  if (!scope) return true;
  if (scope === 'model-type' || scope === 'model-name' || scope === 'model-bracket') return flags.models;
  if (scope === 'bracket' || scope === 'number' || scope === 'func') return flags.weights;
  if (scope === 'wildcards') return flags.wildcards;
  if (scope === 'and' || scope === 'break') return flags.keywords;
  return true;
};

const PromptSegment = memo<{ categoryColor?: string; dark: boolean; flags: HighlightFlags; text: string }>(
  ({ categoryColor, dark, flags, text: segment }) => {
    const defaultColor = promptForeground(dark);
    return highlightRuns(segment, dark).map(({ scope, style, text }, index) => {
      const [color, italic] = style.split(';');
      const scopeActive = isScopeEnabled(scope, flags);
      const runColor = scopeActive ? color.slice(6) : defaultColor;
      const finalColor =
        flags.tagColors && categoryColor && runColor.toLowerCase() === defaultColor.toLowerCase() && text.trim() !== ','
          ? categoryColor
          : runColor;
      return (
        <span key={index} style={{ color: finalColor, fontStyle: scopeActive && italic ? 'italic' : undefined }}>
          {text}
        </span>
      );
    });
  },
);

const splitSegments = (line: string) => line.split(/(?<=,)/);

const PromptLine = memo<{ colorVersion: number; dark: boolean; flags: HighlightFlags; line: string }>(
  ({ dark, flags, line }) => (
    <span className="line">
      {splitSegments(line).map((text, index) => (
        <PromptSegment
          categoryColor={flags.tagColors ? getCachedTagColor(text, dark) : undefined}
          dark={dark}
          flags={flags}
          key={index}
          text={text}
        />
      ))}
    </span>
  ),
);

const SyntaxHighlighter = memo<{ children: string }>(({ children }) => {
  const { styles } = useStyles();
  const { isDarkMode } = useThemeMode();
  const flags = useAppStore(
    (s) => ({
      keywords: s.setting.highlightKeywords ?? true,
      models: s.setting.highlightModels ?? true,
      tagColors: s.setting.highlightTagColors ?? true,
      weights: s.setting.highlightWeights ?? true,
      wildcards: s.setting.highlightWildcards ?? true,
    }),
    isEqual,
  );
  const lines = useMemo(() => children.split(/\r\n|\r|\n/), [children]);
  const segments = useMemo(() => (flags.tagColors ? lines.flatMap(splitSegments) : []), [flags.tagColors, lines]);
  const colorVersion = useTagColors(segments, isDarkMode);
  return (
    <div className={styles.shiki}>
      <pre className={`shiki ${isDarkMode ? 'dark' : 'light'}`} style={{ color: promptForeground(isDarkMode) }}>
        <code id="lobe_highlighter">
          {lines.map((line, index) => (
            <Fragment key={index}>
              {index > 0 && '\n'}
              <PromptLine colorVersion={colorVersion} dark={isDarkMode} flags={flags} line={line} />
            </Fragment>
          ))}
        </code>
      </pre>
    </div>
  );
});

export default SyntaxHighlighter;
