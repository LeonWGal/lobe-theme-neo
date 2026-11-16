import schema from '@/../setting_schema.json';
import { DEFAULT_SETTING, type WebuiSetting, type WebuiSettingKeys } from '@/store/initialState';

interface FieldRule {
  enum?: readonly string[];
  max?: number;
  maxItems?: number;
  maxLength?: number;
  min?: number;
  optional?: boolean;
  type?: string;
}

export const isSettingObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const normalizeSetting = (raw: unknown, strict = false): WebuiSetting => {
  if (!isSettingObject(raw)) {
    if (strict) throw new Error('Invalid settings file');
    return { ...DEFAULT_SETTING };
  }
  const result = { ...DEFAULT_SETTING };
  for (const [key, rule] of Object.entries(schema) as [WebuiSettingKeys, FieldRule][]) {
    if (!(key in raw)) continue;
    let value = raw[key];
    if (rule.optional && (value === undefined || value === null || value === '')) {
      value = key.endsWith('Color') ? undefined : '';
    } else {
      const valid = rule.enum
        ? typeof value === 'string' && rule.enum.includes(value)
        : rule.type === 'array'
          ? Array.isArray(value) &&
            value.length <= (rule.maxItems ?? 32) &&
            value.every((item) => typeof item === 'string' && item.length <= 255)
          : typeof value === rule.type &&
            (rule.type !== 'number' ||
              (Number.isInteger(value) &&
                Number(value) >= rule.min! &&
                Number(value) <= rule.max!)) &&
            (rule.type !== 'string' || String(value).length <= rule.maxLength!);
      if (!valid) {
        if (strict) throw new Error(`Invalid setting: ${key}`);
        continue;
      }
    }
    Object.assign(result, { [key]: value });
  }
  return result;
};
