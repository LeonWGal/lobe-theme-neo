import { useTheme } from 'antd-style';
import { Suspense, lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePanelVisible } from '@/hooks/usePanelVisible';
import { useAppStore } from '@/store';

import { startSingleAccordion } from './accordions';
import { bus } from './bus';
import { startGenerationCapture } from './generation';
import { installProgressHook } from './hook';
import { startLoraTools } from './loraTools';
import { startPromptSections } from './promptSections';

const Palette = lazy(() => import('./CommandPalette'));
const History = lazy(() => import('./HistoryDrawer'));
const InlineQueue = lazy(() => import('./InlineQueue'));
const ResultsLightbox = lazy(() => import('./ResultsLightbox'));
export default function Tools() {
  const setting = useAppStore((s) => s.setting);
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const extraVisible = usePanelVisible('extra');
  const [loraReady, setLoraReady] = useState(false);
  useEffect(() => {
    if (extraVisible) setLoraReady(true);
  }, [extraVisible]);
  const [palette, setPalette] = useState(false);
  const [history, setHistory] = useState(false);
  const [historySection, setHistorySection] = useState<'history' | 'queue'>('history');
  const [loaded, setLoaded] = useState({ history: false, palette: false });
  useEffect(() => {
    if (!installProgressHook() && typeof onUiLoaded === 'function') onUiLoaded(installProgressHook);
  }, []);
  useEffect(() => {
    if (setting.enableHistory)
      return startGenerationCapture({ history: true, notify: false, notifyTitle: '' });
  }, [setting.enableHistory]);
  useEffect(
    () => (setting.accordionMode === 'single' ? startSingleAccordion() : undefined),
    [setting.accordionMode],
  );
  useEffect(() => {
    if (!setting.promptSections) return;
    return startPromptSections({
      colors: [theme.colorPrimary, theme.colorSuccess, theme.colorWarning, theme.colorInfo],
      text: {
        add: t('tools.sections.add'),
        merge: t('tools.sections.merge'),
        section: t('tools.sections.section'),
        toggle: t('tools.sections.toggle'),
        tokens: t('tools.sections.tokens'),
      },
    });
  }, [setting.promptSections, i18n.language]);
  useEffect(() => {
    if (!setting.enableLoraTools || !loraReady) return;
    return startLoraTools({
      colors: {
        fill: theme.colorFillTertiary,
        primary: theme.colorPrimary,
        primaryLight: theme.colorPrimaryTextHover,
      },
      text: {
        all: t('tools.lora.all'),
        compatible: t('tools.lora.compatible'),
        favorite: t('tools.lora.favorite'),
        favorites: t('tools.lora.favorites'),
        recent: t('tools.lora.recent'),
        triggerWords: t('tools.lora.triggerWords'),
        weight: t('tools.lora.weight'),
      },
    });
  }, [
    setting.enableLoraTools,
    loraReady,
    i18n.language,
    theme.colorPrimary,
    theme.colorFillTertiary,
  ]);
  useEffect(() => {
    const openPalette = () => {
      if (setting.enableCommandPalette) {
        setLoaded((p) => ({ ...p, palette: true }));
        setPalette(true);
      }
    };
    const openHistory = () => {
      setHistorySection('history');
      if (setting.enableHistory) {
        setLoaded((p) => ({ ...p, history: true }));
        setHistory(true);
      }
    };
    const openQueue = () => {
      setHistorySection('queue');
      setLoaded((p) => ({ ...p, history: true }));
      setHistory(true);
    };
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openPalette();
      }
    };
    document.addEventListener('keydown', shortcut);
    const off = [
      bus.on('open:palette', openPalette),
      bus.on('open:history', openHistory),
      bus.on('open:queue', openQueue),
      bus.on('open:queue-settings', () => setHistory(false)),
    ];
    return () => {
      document.removeEventListener('keydown', shortcut);
      off.forEach((fn) => fn());
    };
  }, [setting.enableCommandPalette, setting.enableHistory]);
  return (
    <Suspense fallback={null}>
      <InlineQueue />
      <ResultsLightbox />
      {loaded.palette && <Palette onClose={() => setPalette(false)} open={palette} />}{' '}
      {loaded.history && <History initialSection={historySection} onClose={() => setHistory(false)} open={history} />}
    </Suspense>
  );
}
