import { toast } from '@lobehub/ui';
import { Button, Empty, Flex, Modal, Select, Switch } from 'antd';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, Bell, ClearQueue, FileExport, FileImport, Hibernate, Loader2, Moon, Pause, Pending, Play, Power, Replay, X } from '@/icons';

import { getChoices, queueApi, type CompletionAction } from './api';
import { bus } from './bus';
import { refreshQueue, useQueue } from './useQueue';

/* eslint-disable sort-keys-fix/sort-keys-fix -- Dropdown option order */
const completionIcons = { none: Bell, sleep: Moon, hibernate: Hibernate, shutdown: Power, stop: X };
/* eslint-enable sort-keys-fix/sort-keys-fix */

export default function QueuePanel({ settings = false }: { settings?: boolean }) {
  const queue = useQueue();
  const { t } = useTranslation();
  const [modal, dialog] = Modal.useModal();
  const pausedId = useId();
  const completionId = useId();
  const file = useRef<HTMLInputElement>(null);
  const [models, setModels] = useState<string[]>([]);
  const [arches, setArches] = useState<Record<string, string>>({});
  const [preset, setPreset] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      await refreshQueue();
    } catch {
      toast.error(t('tools.queue.error'));
    } finally {
      setBusy(false);
    }
  };
  const loadChoices = () =>
    void getChoices()
      .then((result) => {
        setModels(result.checkpoints);
        setArches(result.checkpointArches ?? {});
        setPreset(result.preset ?? '');
      })
      .catch(() => {});
  useEffect(() => {
    loadChoices();
  }, []);
  const exportQueue = () => run(async () => {
    const data = await queueApi.export();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lobe-queue.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  });
  return (
    <Flex className="lobe-queue-panel" gap={12} vertical>
      {dialog}
      {settings ? (
        <>
          <header>
            <h2>{t('tools.queue.title')}</h2>
            <p>{t('tools.queue.settingsDescription')}</p>
          </header>
          {!queue && <p role="status">{t('tools.queue.unavailable')}</p>}
          <div className="lobe-queue-settings">
            <div className="lobe-queue-setting-row">
              <label htmlFor={pausedId}>{t('tools.queue.pause')}</label>
              <Switch checked={queue?.paused ?? false} disabled={!queue || busy} id={pausedId}
                onChange={(paused) => void run(() => queueApi.settings({ paused }))} />
            </div>
            <div className="lobe-queue-setting-row">
              <label htmlFor={completionId}>{t('tools.queue.completion')}</label>
              <Select<CompletionAction> disabled={!queue || busy} id={completionId}
                onChange={(completion) => {
                  if (completion === 'none') void run(() => queueApi.settings({ completion }));
                  else modal.confirm({
                    onOk: () => run(() => queueApi.settings({ completion })),
                    title: t('tools.queue.completionConfirm', { action: t(`tools.queue.${completion}`) }),
                  });
                }}
                options={(Object.keys(completionIcons) as CompletionAction[]).map((value) => {
                  const Icon = completionIcons[value];
                  return { label: <Flex align="center" gap={6}><Icon size={15} />{t(`tools.queue.${value}`)}</Flex>, value };
                })}
                value={queue?.completion ?? 'none'} />
            </div>
          </div>
        </>
      ) : (
        <Flex align="center" gap={8} justify="space-between" wrap>
          <Button aria-pressed={Boolean(queue?.paused)} disabled={!queue || busy}
            icon={queue?.paused ? <Play size={15} /> : <Pause size={15} />}
            onClick={() => void run(() => queueApi.settings({ paused: !queue?.paused }))}>
            {t(queue?.paused ? 'tools.queue.resume' : 'tools.queue.pause')}
          </Button>
          <Button onClick={() => bus.emit('open:queue-settings')}>{t('tools.queue.settings')}</Button>
        </Flex>
      )}
      {settings && <Flex gap={6} wrap>
        <Button danger disabled={!queue?.items.some(({ status }) => status === 'pending') || busy} icon={<ClearQueue size={16} />} onClick={() => modal.confirm({
          onOk: () => run(queueApi.clear), title: t('tools.queue.clearConfirm'),
        })}>{t('tools.queue.clear')}</Button>
        <Button disabled={!queue || busy} icon={<Replay size={16} />} onClick={() => void run(queueApi.requeueFailed)}>{t('tools.queue.retryFailed')}</Button>
        <Button disabled={!queue || busy} icon={<FileExport size={16} />} onClick={() => void exportQueue()}>{t('tools.queue.export')}</Button>
        <Button disabled={!queue || busy} icon={<FileImport size={16} />} onClick={() => file.current?.click()}>{t('tools.queue.import')}</Button>
        <input accept=".json,application/json" hidden onChange={(event) => {
          const selected = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (selected) void run(async () => queueApi.import(JSON.parse(await selected.text())));
        }} ref={file} type="file" />
      </Flex>}
      {queue?.items.length === 0 && <Empty description={t('tools.queue.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      {preset && queue?.items.some((item) => item.status === 'pending') && (
        <span style={{ fontSize: 12, opacity: 0.72 }}>{t('tools.queue.presetFilterHint', { preset })}</span>
      )}
      {queue?.items.map((item) => (
        <Flex className="lobe-queue-task" gap={6} key={item.id} vertical>
          <strong>{item.name || item.infotext.split('\n')[0] || item.tab}</strong>
          <Flex align="center" className="lobe-queue-task-status" gap={6}>
            {item.status === 'running' ? <Loader2 size={14} /> : <Pending size={14} />}
            <span>{item.tab} · {item.status === 'running' ? t('tools.queue.running') : t('tools.queue.pending')}</span>
          </Flex>
          {item.status === 'pending' && <Flex gap={5} wrap>
            <Select aria-label={t('tools.queue.single')} disabled={busy} onChange={(value) => void run(() => queueApi.patch(item.id, { checkpoint: value || null }))}
              onDropdownVisibleChange={(open) => { if (open) loadChoices(); }} options={[
                { label: t('tools.queue.current'), value: '' },
                ...models.map((value) => {
                  const arch = arches[value];
                  const disabled = Boolean(preset && arch && arch !== 'unknown' && arch !== preset);
                  return {
                    disabled,
                    label: arch && arch !== 'unknown' ? `${value} [${arch}]` : value,
                    value,
                  };
                }),
              ]} showSearch
              size="small"
              style={{ flex: 1, minWidth: 180 }}
              value={item.checkpoint ?? ''} />
            {([-1, 1] as const).map((direction) => <Button aria-label={t(direction === -1 ? 'tools.queue.up' : 'tools.queue.down')} disabled={busy} icon={direction === -1 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              key={direction}
              onClick={() => void run(() => queueApi.move(item.id, direction))}
              size="small" />)}
            <Button danger disabled={busy} icon={<X size={14} />} onClick={() => void run(() => queueApi.cancel(item.id))}
              size="small">{t('tools.queue.remove')}</Button>
          </Flex>}
        </Flex>
      ))}
    </Flex>
  );
}
