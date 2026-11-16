import { toast } from '@lobehub/ui';
import { Button, Dropdown, Flex, Select, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { ArrowDown, ArrowUp, Checkpoint, ChevronDown, Clock, Loader2, Pause, Pending, Play, PlaylistAdd, X } from '@/icons';

import { getChoices, historyApi, queueApi, type CheckpointSelection, type HistoryEntry } from './api';
import { bus, type ProgressInfo } from './bus';
import { installProgressHook } from './hook';
import { refreshQueue, useQueue } from './useQueue';

type Tab = 'txt2img' | 'img2img';
const tabs: Tab[] = ['txt2img', 'img2img'];
const progressTasks = new Set<string>();

type QueueWindow = Window & { lobeQueueShowResult?: (tab: Tab, job: string) => void };

function QueueButton({ tab, strip }: { strip: HistoryEntry[], tab: Tab; }) {
  const queue = useQueue();
  const { t } = useTranslation();
  const [selection, select] = useState<CheckpointSelection>({ mode: 'current' });
  const [models, setModels] = useState<string[]>([]);
  const [arches, setArches] = useState<Record<string, string>>({});
  const [preset, setPreset] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<ProgressInfo>();
  const capture = useRef(false);
  const active = queue?.items.find((item) => item.status === 'running' && item.tab === tab);
  const count = queue?.items.filter((item) => item.tab === tab).length ?? 0;
  const waiting = queue?.items.filter((item) => item.tab === tab && item.status === 'pending') ?? [];
  const mutate = async (operation: () => Promise<unknown>) => {
    try {
      await operation();
      await refreshQueue();
    } catch {
      toast.error(t('tools.queue.error'));
    }
  };
  useEffect(() => {
    setProgress(undefined);
    return bus.on('gen:progress', (event) => {
      if (event.id === active?.job) setProgress(event.info);
    });
  }, [active?.job]);
  const activePreset = preset && preset !== 'all' && preset !== 'none' ? preset : '';
  const loadChoices = () =>
    void getChoices()
      .then((choices) => {
        const nextPreset = choices.preset && choices.preset !== 'all' && choices.preset !== 'none' ? choices.preset : '';
        const nextArches = choices.checkpointArches ?? {};
        setModels(choices.checkpoints);
        setArches(nextArches);
        setPreset(choices.preset ?? '');
        select((prev) => {
          if (!prev.checkpoint) return prev;
          const arch = nextArches[prev.checkpoint];
          if (!choices.checkpoints.includes(prev.checkpoint) || (nextPreset && arch !== nextPreset)) {
            return { ...prev, checkpoint: undefined };
          }
          return prev;
        });
      })
      .catch(() => {});
  const enqueue = async () => {
    const submit = (window as Window & { lobeEnqueue?: (tab: Tab, selection: CheckpointSelection) => Promise<unknown> }).lobeEnqueue;
    if (!submit || capture.current) return;
    if ((selection.mode === 'folder' || selection.mode === 'single') && !selection.checkpoint) {
      toast.warning(t('tools.queue.single'));
      return;
    }
    capture.current = true;
    setBusy(true);
    try {
      await submit(tab, selection);
      await refreshQueue();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('tools.queue.error'));
    } finally {
      capture.current = false;
      setBusy(false);
    }
  };
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (!event.shiftKey || !(event.ctrlKey || event.metaKey) || event.key !== 'Enter' || event.repeat) return;
      const root = typeof gradioApp === 'function' ? gradioApp() : document;
      const panel = root.querySelector(`#tab_${tab}`);
      if (!panel?.getClientRects().length || getComputedStyle(panel).display === 'none') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void enqueue();
    };
    window.addEventListener('keydown', shortcut, true);
    return () => window.removeEventListener('keydown', shortcut, true);
  });
  return (
    <Flex className="lobe-inline-queue-content" gap={6} vertical>
      <Space.Compact block className="lobe-queue-actions">
        <Button icon={<PlaylistAdd size={16} />} loading={busy} onClick={() => void enqueue()}>
          {t('tools.queue.enqueue')}
        </Button>
        <Dropdown menu={{
          items: (['current', 'single', 'folder', 'all'] as const).map((key) => ({ icon: <Checkpoint size={16} />, key, label: t(`tools.queue.${key}`) })),
          onClick: ({ key }) => {
            select({ checkpoint: selection.checkpoint, mode: key as CheckpointSelection['mode'] });
            if (key === 'single' || key === 'folder') loadChoices();
          },
          selectable: true,
          selectedKeys: [selection.mode],
        }} trigger={['click']}>
          <Button aria-label={t('tools.queue.checkpointMode')} icon={<ChevronDown size={15} />}
            title={t('tools.queue.checkpointMode')} />
        </Dropdown>
      </Space.Compact>
      {(selection.mode === 'single' || selection.mode === 'folder') && (
        <>
          <Select aria-label={t('tools.queue.single')} onChange={(checkpoint) => select({ ...selection, checkpoint })} onDropdownVisibleChange={(open) => { if (open) loadChoices(); }}
            options={models
              .filter((value) => !activePreset || arches[value] === activePreset)
              .map((value) => {
                const arch = arches[value];
                return {
                  label: arch && arch !== 'unknown' ? `${value} [${arch}]` : value,
                  value,
                };
              })}
            placeholder={t('tools.queue.single')}
            showSearch
            value={selection.checkpoint} />
          {activePreset && (
            <span style={{ fontSize: 11, opacity: 0.72 }}>
              {t('tools.queue.presetFilterHint', { preset: activePreset })}
            </span>
          )}
        </>
      )}
      <Button className="lobe-queue-status" icon={queue?.paused ? <Pause size={14} /> : active ? <Loader2 size={14} /> : count ? <Pending size={14} /> : <Clock size={14} />} onClick={() => bus.emit('open:queue')} size="small" type="text">
        <span>{queue?.paused ? t('tools.queue.paused') : active ? t('tools.queue.running') : count ? t('tools.queue.pending') : t('tools.queue.view')}</span>
        {progress && <span>{Math.round(progress.progress * 100)}%{progress.eta ? ` · ${Math.ceil(progress.eta)} s` : ''}</span>}
        {count > 0 && <span className="lobe-queue-count">{count}</span>}
      </Button>
      {waiting.length > 0 && <>
        <Button aria-pressed={Boolean(queue?.paused)} icon={queue?.paused ? <Play size={14} /> : <Pause size={14} />} onClick={() => void mutate(() => queueApi.settings({ paused: !queue?.paused }))} size="small">
          {t(queue?.paused ? 'tools.queue.resume' : 'tools.queue.pause')}
        </Button>
        {waiting.slice(0, 3).map((task, index) => <Flex className="lobe-inline-task" gap={3} key={task.id}>
          <span title={task.name || task.infotext}>{task.name || task.infotext.split('\n')[0] || tab}</span>
          <Button aria-label={t('tools.queue.up')} disabled={index === 0} icon={<ArrowUp size={14} />} onClick={() => void mutate(() => queueApi.move(task.id, -1))}
            size="small" />
          <Button aria-label={t('tools.queue.down')} disabled={index === waiting.length - 1} icon={<ArrowDown size={14} />} onClick={() => void mutate(() => queueApi.move(task.id, 1))}
            size="small" />
          <Button aria-label={t('tools.queue.remove')} icon={<X size={14} />} onClick={() => void mutate(() => queueApi.cancel(task.id))}
            size="small" />
        </Flex>)}
      </>}
      {strip.length > 0 && <div className="lobe-queue-strip">
        {strip.map((entry, index) => <button aria-label={t('gallery.viewer')} className="lobe-queue-thumb" key={entry.id}
          onClick={() => bus.emit('open:lightbox', { index, items: strip })} type="button">
          <img alt="" decoding="async" src={entry.images[0].thumb ? historyApi.thumbUrl(entry.images[0].thumb) : entry.images[0].url} />
        </button>)}
      </div>}
    </Flex>
  );
}

export default function InlineQueue() {
  const queue = useQueue(true);
  const [hosts, setHosts] = useState<Partial<Record<Tab, HTMLElement>>>({});
  const [recent, setRecent] = useState<HistoryEntry[]>([]);
  const available = Boolean(queue);
  useEffect(() => {
    if (!available) return;
    const root = typeof gradioApp === 'function' ? gradioApp() : document;
    const attached: Partial<Record<Tab, HTMLElement>> = {};
    const attach = () => {
      for (const tab of tabs) {
        if (attached[tab]?.isConnected) continue;
        const box = root.querySelector(`#${tab}_generate_box`);
        if (!box) continue;
        const mount = document.createElement('div');
        mount.className = 'lobe-inline-queue';
        mount.dataset.lobeLocalized = '';
        if (!root.querySelector(`#${tab}_enqueue_wrapper`)) mount.id = `${tab}_enqueue_wrapper`;
        box.after(mount);
        attached[tab] = mount;
        setHosts({ ...attached });
      }
    };
    attach();
    const observer = new MutationObserver(() => {
      if (tabs.some((tab) => !attached[tab]?.isConnected)) attach();
    });
    observer.observe(root, { childList: true, subtree: true });
    const load = () => void historyApi.list({ limit: 20, status: 'done' }).then(({ items }) =>
      setRecent(items.filter((item) => item.images.length))).catch(() => {});
    load();
    const completed = new Map<string, Tab>();
    const restore = (tab: Tab, job: string) => (window as QueueWindow).lobeQueueShowResult?.(tab, job);
    const off = [
      bus.on('queue:changed', load),
      bus.on('history:added', load),
      bus.on('queue:finished', ({ job, status, tab }) => {
        if (status !== 'done' || !job || (tab !== 'txt2img' && tab !== 'img2img')) return;
        if (progressTasks.has(job)) completed.set(job, tab);
        else restore(tab, job);
      }),
      bus.on('gen:end', ({ id }) => {
        const tab = completed.get(id);
        if (!tab) return;
        completed.delete(id);
        restore(tab, id);
      }),
    ];
    return () => {
      observer.disconnect();
      Object.values(attached).forEach((element) => element.remove());
      off.forEach((unsubscribe) => unsubscribe());
    };
  }, [available]);
  useEffect(() => {
    const root = typeof gradioApp === 'function' ? gradioApp() : document;
    for (const task of queue?.items ?? []) {
      if (task.status !== 'running' || !task.job || progressTasks.has(task.job)) continue;
      const gallery = root.querySelector<HTMLElement>(`#${task.tab}_gallery`);
      const container = root.querySelector<HTMLElement>(`#${task.tab}_gallery_container`);
      const request = (window as any).requestProgress;
      if (!gallery || !container || !installProgressHook() || typeof request !== 'function') continue;
      if (container.parentElement?.querySelector(':scope > .progressDiv')) continue;
      const job = task.job;
      progressTasks.add(job);
      (window as any).showSubmitButtons?.(task.tab, false);
      (window as any).requestProgress(job, container, gallery, () => {
        progressTasks.delete(job);
        (window as any).showSubmitButtons?.(task.tab, true);
        void refreshQueue();
      });
    }
  }, [queue]);
  return tabs.map((tab) => hosts[tab] && createPortal(
    <QueueButton strip={recent.filter((item) => item.tab === tab).slice(0, 7)} tab={tab} />, hosts[tab], tab,
  ));
}
