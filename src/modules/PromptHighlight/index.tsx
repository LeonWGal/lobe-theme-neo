import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useExternalTextareaObserver } from '@/hooks/useExternalTextareaObserver';
import { textareaOverlayBounds } from '@/utils/textareaOverlay';

import SyntaxHighlighter from './features/SyntaxHighlighter';
import { useStyles } from './style';

interface AppProps {
  parentId: string;
}

// Large prompts are faster to edit in the native textarea than in a second wrapped DOM tree.
const MAX_HIGHLIGHT_LENGTH = 6000;

const ObservedHighlight = memo<{
  caretColor: string;
  selector: string;
  textarea: HTMLTextAreaElement;
}>(({ caretColor, selector, textarea }) => {
  const value = useExternalTextareaObserver(selector, true);
  const highlight = value.length <= MAX_HIGHLIGHT_LENGTH;

  useLayoutEffect(() => {
    if (!highlight) return;
    const previousColor = textarea.style.color;
    const previousCaretColor = textarea.style.caretColor;
    const previousBg = textarea.style.getPropertyValue('background');
    const previousBgPriority = textarea.style.getPropertyPriority('background');
    const previousBgColor = textarea.style.getPropertyValue('background-color');
    const previousBgColorPriority = textarea.style.getPropertyPriority('background-color');
    textarea.style.color = 'transparent';
    textarea.style.caretColor = caretColor;
    textarea.style.setProperty('background', 'transparent', 'important');
    textarea.style.setProperty('background-color', 'transparent', 'important');
    return () => {
      textarea.style.color = previousColor;
      textarea.style.caretColor = previousCaretColor;
      if (previousBg) textarea.style.setProperty('background', previousBg, previousBgPriority);
      else textarea.style.removeProperty('background');
      if (previousBgColor) textarea.style.setProperty('background-color', previousBgColor, previousBgColorPriority);
      else textarea.style.removeProperty('background-color');
    };
  }, [caretColor, highlight, textarea]);

  return highlight ? <SyntaxHighlighter>{value}</SyntaxHighlighter> : null;
});

const Index = memo<AppProps>(({ parentId }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { styles, theme } = useStyles();
  const textareaSelector = `${parentId} textarea, ${parentId} label textarea`;

  const getNativeTextarea = useCallback((): HTMLTextAreaElement | null => {
    const root = (typeof gradioApp === 'function' ? gradioApp() : null) || document;
    return root.querySelector(textareaSelector) as HTMLTextAreaElement | null;
  }, [textareaSelector]);

  const [nativeTextarea, setNativeTextarea] = useState<HTMLTextAreaElement | null>(() =>
    getNativeTextarea(),
  );

  useEffect(() => {
    const el = getNativeTextarea();
    if (el) setNativeTextarea(el);
  }, [getNativeTextarea]);

  const [bounds, setBounds] = useState<ReturnType<typeof textareaOverlayBounds>>();
  useLayoutEffect(() => {
    const overlay = ref.current;
    const parent = (overlay?.offsetParent || nativeTextarea?.closest(parentId)) as HTMLElement | null;
    if (!nativeTextarea || !overlay || !parent) return;
    const syncScroll = () => { overlay.scrollTop = nativeTextarea.scrollTop; };
    const measure = () => {
      const next = textareaOverlayBounds(nativeTextarea, parent);
      setBounds((previous) => previous && previous.height === next.height &&
        previous.width === next.width && previous.left === next.left && previous.top === next.top
        ? previous : next);
      syncScroll();
    };
    measure();
    const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    resize?.observe(nativeTextarea);
    resize?.observe(parent);
    nativeTextarea.addEventListener('scroll', syncScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      resize?.disconnect();
      nativeTextarea.removeEventListener('scroll', syncScroll);
      window.removeEventListener('resize', measure);
    };
  }, [nativeTextarea, parentId]);

  return (
    <div className={styles.container} data-code-type="highlighter" ref={ref} style={bounds}>
      {nativeTextarea && bounds?.width !== 0 && (
        <ObservedHighlight
          caretColor={theme.colorSuccess}
          selector={textareaSelector}
          textarea={nativeTextarea}
        />
      )}
    </div>
  );
});

export default Index;
