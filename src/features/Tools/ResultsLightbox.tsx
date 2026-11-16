import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X } from '@/icons';

import { bus, type BusEvents } from './bus';

export default function ResultsLightbox() {
  const { t } = useTranslation();
  const [view, setView] = useState<BusEvents['open:lightbox']>();
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const images = view?.items.flatMap((entry) => entry.images.map((image) => ({ ...image, id: entry.id }))) ?? [];
  useEffect(() => bus.on('open:lightbox', (next) => {
    setIndex(next.items.slice(0, next.index).reduce((total, item) => total + item.images.length, 0));
    setView(next);
  }), []);
  useEffect(() => {
    if (view && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [view]);
  const move = (direction: number) => setIndex((current) => (current + direction + images.length) % images.length);
  if (!view || !images.length) return null;
  return (
    <dialog aria-label={t('gallery.viewer')} className="lobe-results-lightbox" onClose={() => setView(undefined)} onKeyDownCapture={(event) => {
        if (!['Escape', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.stopPropagation();
        event.preventDefault();
        if (event.key === 'Escape') dialog.current?.close();
        else move(event.key === 'ArrowLeft' ? -1 : 1);
      }}
      ref={dialog}>
      <header>
        <button aria-label={t('gallery.previous')} onClick={() => move(-1)} type="button"><ChevronLeft size={18} /></button>
        <span>{index + 1} / {images.length}</span>
        <button aria-label={t('gallery.next')} onClick={() => move(1)} type="button"><ChevronRight size={18} /></button>
        <button aria-label={t('gallery.close')} onClick={() => dialog.current?.close()} type="button"><X size={18} /></button>
      </header>
      <img alt="" src={images[index]?.url} />
    </dialog>
  );
}
