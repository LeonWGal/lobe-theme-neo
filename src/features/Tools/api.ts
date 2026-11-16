/** Client for the theme's own server routes (scripts/lib/api.py). */

export interface HistoryImage {
  thumb: string | null;
  url: string;
}
export interface HistoryEntry {
  bookmarked?: number;
  checkpoint?: string | null;
  error?: string | null;
  id: string;
  images: HistoryImage[];
  infotext: string;
  job?: string;
  name?: string | null;
  replayable?: boolean;
  status?: 'pending' | 'running' | 'done' | 'failed' | 'interrupted';
  tab: string;
  time: number;
}
export interface LoraInfo {
  alias: string;
  arch: Arch;
  name: string;
  triggerWords: string[];
}
/** Model families, named after Forge Classic (Neo)'s UI presets (plus sd2 and sd3). */
export type Arch =
  | 'sd'
  | 'sd2'
  | 'xl'
  | 'sd3'
  | 'flux'
  | 'klein'
  | 'qwen'
  | 'lumina'
  | 'zit'
  | 'wan'
  | 'anima'
  | 'ernie'
  | 'pid'
  | 'krea'
  | 'unknown';
export interface Choices {
  checkpointArches?: Record<string, string>;
  checkpoints: string[];
  preset?: string;
  samplers: string[];
  schedulers: string[];
}

const json = async <T>(input: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new Error(`${input}: ${response.status}`);
  return response.json();
};

export const historyApi = {
  add: (entry: {
    images: { thumb?: string; url: string }[];
    infotext: string;
    job?: string;
    tab: string;
    time: number;
  }) => json<HistoryEntry>('/lobe/history', { body: JSON.stringify(entry), method: 'POST' }),
  clear: () => json<{ deleted: number }>('/lobe/history', { method: 'DELETE' }),
  list: (parameters: { limit?: number; offset?: number; q?: string; status?: string; tab?: string } = {}) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(parameters)) {
      if (value !== undefined && value !== '') query.set(key, String(value));
    }
    return json<{ items: HistoryEntry[]; total: number }>(`/lobe/history?${query}`);
  },
  remove: (id: string) => json<{ deleted: number }>(`/lobe/history/${id}`, { method: 'DELETE' }),
  thumbUrl: (name: string) => `/lobe/history/thumbs/${name}`,
};

export type CheckpointSelection = { checkpoint?: string, mode: 'current' | 'single' | 'folder' | 'all'; };
export type CompletionAction = 'none' | 'sleep' | 'hibernate' | 'shutdown' | 'stop';
export type QueueStatus = { completion: CompletionAction, count: number; items: HistoryEntry[]; paused: boolean; };
const write = (method: string, data?: unknown): RequestInit => ({
  body: data === undefined ? undefined : JSON.stringify(data), method,
});
const taskUrl = (id: string) => '/lobe/task/' + encodeURIComponent(id);
export const queueApi = {
  cancel: (id: string) => json(taskUrl(id), write('DELETE')),
  clear: () => json('/lobe/queue', write('DELETE')),
  export: () => json('/lobe/queue/export'),
  import: (data: unknown) => json('/lobe/queue/import', write('POST', data)),
  list: () => json<QueueStatus>('/lobe/queue'),
  move: (id: string, direction: number) => json(taskUrl(id) + '/move', write('POST', { direction })),
  patch: (id: string, data: { bookmarked?: boolean; checkpoint?: string | null }) =>
    json<HistoryEntry>(taskUrl(id), write('PATCH', data)),
  requeue: (id: string) => json(taskUrl(id) + '/requeue', write('POST')),
  requeueFailed: () => json('/lobe/queue/requeue-failed', write('POST')),
  settings: (settings: Partial<Pick<QueueStatus, 'paused' | 'completion'>>) =>
    json<QueueStatus>('/lobe/queue', write('PATCH', settings)),
  task: (id: string) => json<HistoryEntry>(taskUrl(id)),
};

/** Small lists kept on the server (favourite LoRAs, presets, ...). */
export const userdata = {
  get: async <T>(key: string, fallback: T): Promise<T> => {
    try {
      const { value } = await json<{ value: T | null }>(`/lobe/userdata/${key}`);
      return value ?? fallback;
    } catch {
      return fallback;
    }
  },
  set: (key: string, value: unknown) =>
    json(`/lobe/userdata/${key}`, { body: JSON.stringify({ value }), method: 'PUT' }),
};

export const getLoras = () => json<LoraInfo[]>('/lobe/loras').catch(() => [] as LoraInfo[]);
export const getModel = () =>
  json<{ arch: Arch; checkpoint: string }>('/lobe/model').catch(() => ({
    arch: 'unknown' as Arch,
    checkpoint: '',
  }));
export const getChoices = () =>
  json<Choices>('/lobe/choices').catch(
    () => ({ checkpoints: [], samplers: [], schedulers: [] }) as Choices,
  );
