import { useEffect, useSyncExternalStore } from 'react';

import { queueApi, type QueueStatus } from './api';
import { bus } from './bus';

let snapshot: QueueStatus | undefined;
let request: Promise<void> | undefined;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const sameQueueStatus = (a: QueueStatus | undefined, b: QueueStatus) => {
  if (!a) return false;
  if (a.count !== b.count || a.paused !== b.paused || a.completion !== b.completion) return false;
  if (a.items.length !== b.items.length) return false;
  for (let i = 0; i < a.items.length; i++) {
    const x = a.items[i];
    const y = b.items[i];
    if (
      x.id !== y.id ||
      x.status !== y.status ||
      x.time !== y.time ||
      x.job !== y.job ||
      x.name !== y.name ||
      x.error !== y.error ||
      x.checkpoint !== y.checkpoint ||
      x.bookmarked !== y.bookmarked
    ) {
      return false;
    }
  }
  return true;
};

export const refreshQueue = () => request ??= queueApi.list().then((state) => {
  if (sameQueueStatus(snapshot, state)) return;
  const nextIds = new Set(state.items.map(({ id }) => id));
  const departed = snapshot?.items.filter(({ id }) => !nextIds.has(id)) ?? [];
  snapshot = state;
  listeners.forEach((listener) => listener());
  if (departed.length) bus.emit('queue:changed');
  for (const task of departed) {
    if (task.status === 'running' || task.status === 'pending') {
      void queueApi.task(task.id).then((item) => {
        if (item.status === 'done' || item.status === 'failed' || item.status === 'interrupted') {
          bus.emit('queue:finished', item);
        }
      }).catch(() => {});
    }
  }
}).catch(() => {}).finally(() => { request = undefined; });

export function useQueue(poll = false) {
  const state = useSyncExternalStore(subscribe, () => snapshot);
  useEffect(() => {
    if (!poll) return;
    const refresh = () => { if (!document.hidden) void refreshQueue(); };
    const timer = window.setInterval(refresh, 1800);
    window.addEventListener('lobe:queue-updated', refresh);
    document.addEventListener('visibilitychange', refresh);
    refresh();
    return () => {
      clearInterval(timer);
      window.removeEventListener('lobe:queue-updated', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [poll]);
  return state;
}
