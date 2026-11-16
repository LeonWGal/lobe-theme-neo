import { useEffect, useState } from 'react';

type TagCompleteWindow = Window & {
  lobeTagComplete?: {
    lookupTagColors?: (names: string[], dark?: boolean) => Promise<Record<string, string> | null>;
  };
};

const caches = {
  dark: new Map<string, string | null>(),
  light: new Map<string, string | null>(),
};

const listeners = new Set<() => void>();
let pending = new Set<string>();
let pendingDark = true;
let timer: ReturnType<typeof setTimeout> | undefined;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let retryCount = 0;

function scheduleRetry() {
  if (typeof document !== 'undefined' && document.documentElement.dataset.lobeAutocompleteMode === 'off') {
    return;
  }
  if (retryTimer || retryCount >= 8) return;
  retryTimer = setTimeout(() => {
    retryTimer = undefined;
    retryCount += 1;
    if ((window as TagCompleteWindow).lobeTagComplete?.lookupTagColors) {
      for (const notify of listeners) notify();
    } else if (retryCount < 8) {
      scheduleRetry();
    }
  }, 500);
}

if (typeof window !== 'undefined') {
  window.addEventListener('lobe:tagcomplete-loaded', () => {
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = undefined;
    }
    retryCount = 0;
    for (const cache of [caches.dark, caches.light]) {
      for (const [key, value] of cache) {
        if (value === null) cache.delete(key);
      }
    }
    for (const notify of listeners) notify();
  });
}

export function normalizeTagForLookup(raw: string): string {
  let text = raw.trim().replace(/,+$/u, '').trim();
  if (!text || text.startsWith('<') || text.startsWith('__') || text.startsWith('#')) return '';
  // Strip outer attention brackets and weights like (tag:1.2) or [tag]
  while (/^[([{].*[)\]}]$/.test(text)) {
    text = text.slice(1, -1).trim();
  }
  const weightMatch = text.match(/^(.*?):\s*-?\d+(?:\.\d+)?$/);
  if (weightMatch && weightMatch[1].trim()) {
    text = weightMatch[1].trim();
  }
  text = text.replaceAll(/\\([()[\]{}])/g, '$1').replaceAll('_', ' ').trim().toLowerCase();
  if (text.startsWith('@')) text = text.slice(1).trim();
  return text;
}

export function getCachedTagColor(raw: string, dark: boolean): string | undefined {
  const key = normalizeTagForLookup(raw);
  if (!key) return undefined;
  const cache = dark ? caches.dark : caches.light;
  return cache.get(key) ?? undefined;
}

function scheduleLookup(keys: string[], dark: boolean) {
  if (keys.length === 0) return;
  const lookup = (window as TagCompleteWindow).lobeTagComplete?.lookupTagColors;
  if (!lookup) {
    scheduleRetry();
    return;
  }
  const cache = dark ? caches.dark : caches.light;
  let added = false;
  for (const key of keys) {
    if (key && !cache.has(key)) {
      pending.add(key);
      added = true;
    }
  }
  if (!added) return;
  pendingDark = dark;
  if (timer) return;
  timer = setTimeout(() => {
    timer = undefined;
    const batch = [...pending];
    const isDark = pendingDark;
    pending = new Set();
    if (batch.length === 0) return;
    void lookup(batch, isDark)
      .then((colors) => {
        if (!colors) {
          scheduleRetry();
          return;
        }
        const target = isDark ? caches.dark : caches.light;
        let changed = false;
        for (const key of batch) {
          const color = colors[key] ?? null;
          if (target.get(key) !== color) {
            target.set(key, color);
            if (color) changed = true;
          }
        }
        if (changed) {
          for (const notify of listeners) notify();
        }
      })
      .catch(() => {
        scheduleRetry();
      });
  }, 40);
}

export function useTagColors(rawTags: string[], dark: boolean): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const notify = () => setVersion((v) => v + 1);
    listeners.add(notify);
    return () => {
      listeners.delete(notify);
    };
  }, []);

  useEffect(() => {
    const keys = rawTags.map(normalizeTagForLookup).filter(Boolean);
    if (keys.length > 0) scheduleLookup(keys, dark);
  }, [rawTags.join('\u0001'), dark, version]);

  return version;
}
