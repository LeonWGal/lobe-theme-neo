import { useScroll, useSize } from 'ahooks';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useExternalTextareaObserver } from '@/hooks/useExternalTextareaObserver';

import SyntaxHighlighter from './features/SyntaxHighlighter';
import { useStyles } from './style';

interface AppProps {
  parentId: string;
}

const Index = memo<AppProps>(({ parentId }) => {
  const ref: any = useRef(null);
  const [prompt, setPrompt] = useState<string>('');
  const { styles, theme } = useStyles();
  const textareaSelector = `${parentId} textarea, ${parentId} label textarea`;
  const nativeTextareaValue = useExternalTextareaObserver(textareaSelector);

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

  const size = useSize(nativeTextarea || undefined);
  const scroll = useScroll(nativeTextarea || undefined);

  const handlePromptChange = useCallback((event: any) => {
    setPrompt(event.target.value);
  }, []);

  const handlePromptResize = useCallback(() => {
    if (!nativeTextarea) return size?.width === undefined ? '' : size.width;
    if (nativeTextarea.clientHeight < nativeTextarea.scrollHeight) {
      return size?.width === undefined ? '' : size?.width + 6;
    } else {
      return size?.width === undefined ? '' : size?.width + 2;
    }
  }, [nativeTextarea, size?.width]);

  useEffect(() => {
    if (ref.current) {
      ref.current.scroll(0, scroll?.top || 0);
    }
  }, [scroll?.top]);

  useEffect(() => {
    if (!nativeTextarea) return;
    nativeTextarea.addEventListener('input', handlePromptChange);
    nativeTextarea.addEventListener('change', handlePromptChange);
    return () => {
      nativeTextarea.removeEventListener('input', handlePromptChange);
      nativeTextarea.removeEventListener('change', handlePromptChange);
    };
  }, [nativeTextarea, handlePromptChange]);

  useEffect(() => {
    if (theme && nativeTextarea) {
      nativeTextarea.style.color = 'transparent';
      nativeTextarea.style.caretColor = theme.colorSuccess;
    }
  }, [theme, nativeTextarea]);

  useEffect(() => {
    setPrompt(nativeTextareaValue);
  }, [nativeTextareaValue]);

  return (
    <div
      className={styles.container}
      data-code-type="highlighter"
      ref={ref}
      style={{ height: size?.height, width: handlePromptResize() }}
    >
      <SyntaxHighlighter>{prompt}</SyntaxHighlighter>
    </div>
  );
});

export default Index;
