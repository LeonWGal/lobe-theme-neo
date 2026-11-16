import { ColorSwatches } from '@lobehub/ui';
import { Button, Input, Radio, Segmented, Select, Slider, Space, Switch } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CustomLogo } from '@/components';
import { useAppStore } from '@/store';
import { getNeutralTokens } from '@/styles/neutralTokens';
import { NEUTRAL_THEME_IDS } from '@/styles/themeColors';

import { useSettingDraft } from '../Draft';
import Form from './DraftForm';
import {
  BOOT_SCENES,
  findCustomThemeName,
  primaryColors,
  primaryColorsSwatches,
} from './data';
import { SettingItemGroup } from './types';

const useStyles = createStyles(({ css }) => ({
  paletteName: css`
    font-size: 12px;
    line-height: 1.3;
    overflow-wrap: anywhere;
  `,
  palettes: css`
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(min(88px, 100%), 1fr));
    gap: 6px;
    width: 100%;
    .ant-radio-wrapper {
      position: relative;
      display: block;
      min-width: 0;
      margin: 0;
      padding: 5px 6px 6px;
      border: 1px solid var(--lobe-color-border);
      border-radius: var(--lobe-radius) !important;
      color: var(--lobe-text);
      background: var(--lobe-surface);
      &:hover { background: var(--lobe-field); }
      &:has(input:checked) {
        border-color: var(--lobe-accent-text);
        box-shadow: inset 0 0 0 1px var(--lobe-accent-text);
      }
      &:has(input:focus-visible) { outline: 2px solid var(--lobe-text); outline-offset: 2px; }
      > .ant-radio {
        position: absolute;
        opacity: 0;
      }
      > span:last-child { display: grid; gap: 4px; padding: 0; }
    }
  `,
  preview: css`
    display: flex;
    height: 24px;
    overflow: hidden;
    border: 1px solid var(--lobe-border);
    border-radius: var(--lobe-radius-sm);
    > span { flex: 1; }
  `,
}));

const ALL_BOOT_SCENE_IDS = BOOT_SCENES.map((s) => s.id);
const BOOT_SCENE_OPTIONS = BOOT_SCENES.map((s) => ({ label: s.label, value: s.id }));

const NATIVE_LOCALE_LABELS: Record<string, string> = {
  None: 'English',
  de_DE: 'Deutsch (de_DE)',
  es_ES: 'Español (es_ES)',
  fr_FR: 'Français (fr_FR)',
  it_IT: 'Italiano (it_IT)',
  ja_JP: '日本語 (ja_JP)',
  ko_KR: '한국어 (ko_KR)',
  pl_PL: 'Polski (pl_PL)',
  pt_BR: 'Português (pt_BR)',
  ru_RU: 'Русский (ru_RU)',
  zh_CN: '简体中文 (zh_CN)',
  zh_HK: '繁體中文 (zh_HK)',
  zh_TW: '繁體中文 (zh_TW)',
};

const BootScenesSelect = memo<{ onChange?: (_value: string) => void; value?: string }>(
  ({ onChange, value }) => {
    const { t } = useTranslation();
    const selected = useMemo(
      () =>
        (value || '')
          .split(',')
          .map((id) => id.trim())
          .filter((id) => ALL_BOOT_SCENE_IDS.includes(id as (typeof ALL_BOOT_SCENE_IDS)[number])),
      [value],
    );

    return (
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        <Select
          mode="multiple"
          onChange={(ids: string[]) => onChange?.(ids.join(','))}
          options={BOOT_SCENE_OPTIONS}
          placeholder={t('setting.bootSplash.scenesPlaceholder')}
          style={{ width: '100%' }}
          value={selected}
        />
        <Space size={8}>
          <Button
            disabled={selected.length === ALL_BOOT_SCENE_IDS.length}
            onClick={() => onChange?.(ALL_BOOT_SCENE_IDS.join(','))}
            size="small"
          >
            {t('setting.bootSplash.selectAll')}
          </Button>
          <Button
            disabled={selected.length === 0}
            onClick={() => onChange?.('')}
            size="small"
          >
            {t('setting.bootSplash.clear')}
          </Button>
        </Space>
      </Space>
    );
  },
);

const SettingForm = memo(() => {
  const { draft: setting, updateDraft, apply } = useSettingDraft();
  const rawSetting = setting;
  const { t } = useTranslation();
  const { styles } = useStyles();
  const localeOptions = useAppStore((st) => st.localeOptions);
  const [native, setNative] = useState<{
    active: string;
    managedByLanguageDiffusion?: boolean;
    options: string[];
  }>();
  const [nativeDraft, setNativeDraft] = useState<string>();
  const [nativeStatus, setNativeStatus] = useState<'saving' | 'saved' | 'error'>();
  useEffect(() => {
    const controller = new AbortController();
    void fetch('/lobe/native-locales', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : undefined))
      .then((data) => {
        if (data?.options && !controller.signal.aborted) setNative(data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const saveNativeLocale = async () => {
    if (!native || !nativeDraft) return;
    setNativeStatus('saving');
    try {
      const response = await fetch('/lobe/native-locales', {
        body: JSON.stringify({ language: nativeDraft }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      if (!response.ok) throw new Error('Could not save WebUI localization');
      setNative({ ...native, active: nativeDraft });
      setNativeStatus('saved');
    } catch {
      setNativeStatus('error');
    }
  };
  const primaryColor = setting.primaryColor;
  const neutralColor = setting.neutralColor;
  const themeMode = useAppStore((st) => st.themeMode);
  const paletteMode = setting.themeAppearance === 'auto' ? themeMode : setting.themeAppearance;

  const theme: SettingItemGroup = useMemo(
    () => ({
      children: [
        {
          children: (
            <Segmented
              options={[
                { label: t('setting.appearanceMode.auto'), value: 'auto' },
                { label: t('setting.appearanceMode.light'), value: 'light' },
                { label: t('setting.appearanceMode.dark'), value: 'dark' },
              ]}
            />
          ),
          desc: t('setting.appearanceMode.desc'),
          label: t('setting.appearanceMode.title'),
          name: 'themeAppearance',
        },
        {
          children: <Select
            options={localeOptions}
            showSearch={false}
          />,
          desc: t('setting.language.desc'),
          label: t('setting.language.title'),
          name: 'i18n',
        },
        {
          children: native ? (
            <Space wrap>
              <Select
                aria-label={t('setting.language.nativeTitle')}
                disabled={nativeStatus === 'saving'}
                id="lobe-native-language"
                onChange={(value) => {
                  setNativeDraft(value);
                  setNativeStatus(undefined);
                }}
                options={native.options.map((value) => ({
                  label:
                    value === 'None'
                      ? native.managedByLanguageDiffusion
                        ? 'English'
                        : t('setting.language.nativeNone')
                      : NATIVE_LOCALE_LABELS[value] ?? value,
                  value,
                }))}
                style={{ minWidth: 180 }}
                value={nativeDraft ?? native.active}
              />
              <Button
                disabled={!nativeDraft || nativeDraft === native.active}
                loading={nativeStatus === 'saving'}
                onClick={() => void saveNativeLocale()}
              >
                {t('setting.language.nativeSave')}
              </Button>
              {nativeStatus === 'saved' && (
                <Button onClick={() => window.location.reload()} size="small" type="link">
                  {t('setting.language.nativeReload')}
                </Button>
              )}
              {nativeStatus === 'error' && (
                <span role="status">{t('setting.button.saveError')}</span>
              )}
            </Space>
          ) : null,
          desc: t('setting.language.nativeDesc'),
          divider: false,
          hidden: !native,
          label: native?.managedByLanguageDiffusion
            ? t('setting.language.diffusionTitle')
            : t('setting.language.nativeTitle'),
        },
        {
          children: <Switch />,
          desc: t('setting.reduceAnimation.desc'),
          label: t('setting.reduceAnimation.title'),
          name: 'liteAnimation',
          valuePropName: 'checked',
        },
        {
          children: (
            <ColorSwatches
              colors={primaryColorsSwatches}
              onChange={(c?: string) =>
                updateDraft({ primaryColor: findCustomThemeName('primary', c) || undefined })
              }
              value={primaryColor ? primaryColors[primaryColor] : undefined}
            />
          ),
          desc: t('setting.primaryColor.desc'),
          label: t('setting.primaryColor.title'),
        },
        {
          children: (
            <Radio.Group
              aria-label={t('setting.neutralColor.title')}
              className={`${styles.palettes} lobe-neutral-palettes`}
              onChange={({ target }) => updateDraft({ neutralColor: target.value || undefined })}
              role="radiogroup"
              value={neutralColor ?? ''}
            >
              {NEUTRAL_THEME_IDS.map((name) => {
                const palette = getNeutralTokens(
                  paletteMode,
                  name || undefined,
                  rawSetting.themeBrightness ?? 0,
                );
                return (
                  <Radio key={name} value={name}>
                    <span aria-hidden="true" className={styles.preview}>
                      <span style={{ background: palette.colorBgLayout }} />
                      <span style={{ background: palette.colorBgContainer }} />
                      <span style={{ background: palette.colorBgSpotlight }} />
                    </span>
                    <span className={styles.paletteName}>
                      {name ? name[0].toUpperCase() + name.slice(1) : t('setting.neutralColor.defaultOption', { defaultValue: 'Default' })}
                    </span>
                  </Radio>
                );
              })}
            </Radio.Group>
          ),
          desc: t('setting.neutralColor.previewDescription', { defaultValue: 'Preview of the workspace, panels, and raised surfaces.' }),
          label: t('setting.neutralColor.title'),
        },
        {
          children: (
            <Space align="center" size={10} style={{ width: '100%' }}>
              <Slider
                max={30}
                min={-30}
                onChange={(value: number) => updateDraft({ themeBrightness: value })}
                step={5}
                style={{ flex: 1, minWidth: 160 }}
                value={rawSetting.themeBrightness ?? 0}
              />
              <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: 42, textAlign: 'right' }}>
                {(rawSetting.themeBrightness ?? 0) > 0 ? `+${rawSetting.themeBrightness}` : (rawSetting.themeBrightness ?? 0)}%
              </span>
              <Button
                disabled={(rawSetting.themeBrightness ?? 0) === 0}
                onClick={() => updateDraft({ themeBrightness: 0 })}
                size="small"
              >
                {t('setting.button.reset', { defaultValue: 'Reset' })}
              </Button>
            </Space>
          ),
          desc: t('setting.themeBrightness.desc', {
            defaultValue: 'Adjusts surface lightness while preserving contrast between background, cards, and borders.',
          }),
          label: t('setting.themeBrightness.title', { defaultValue: 'Theme Brightness' }),
        },
        {
          children: (
            <Segmented
              options={[
                {
                  label: t('brand.lobe'),
                  value: 'lobe',
                },
                {
                  label: t('brand.kitchen'),
                  value: 'kitchen',
                },
                {
                  label: t('brand.custom'),
                  value: 'custom',
                },
              ]}
            />
          ),
          desc: t('setting.logoType.desc'),
          label: t('setting.logoType.title'),
          name: 'logoType',
        },
        {
          children: <Input />,
          desc: t('setting.customLogo.desc'),
          divider: false,
          hidden: rawSetting.logoType !== 'custom',
          label: t('setting.customLogo.title'),
          name: 'logoCustomUrl',
        },
        {
          children: <Input />,
          desc: t('setting.customTitle.desc'),
          divider: false,
          hidden: rawSetting.logoType !== 'custom',
          label: t('setting.customTitle.title'),
          name: 'logoCustomTitle',
        },
        {
          children: (
            <CustomLogo
              logoCustomTitle={rawSetting.logoCustomTitle}
              logoCustomUrl={rawSetting.logoCustomUrl}
            />
          ),
          divider: false,
          hidden: rawSetting.logoType !== 'custom',
          label: t('setting.logoType.preview'),
        },
        {
          children: <Switch />,
          desc: t('setting.svgIcons.desc'),
          label: t('setting.svgIcons.title'),
          name: 'svgIcon',
          valuePropName: 'checked',
        },
        {
          children: <Switch />,
          desc: t('setting.customFont.desc'),
          label: t('setting.customFont.title'),
          name: 'enableWebFont',
          valuePropName: 'checked',
        },
        {
          children: <Switch />,
          desc: t('setting.confirmPageUnload.desc'),
          label: t('setting.confirmPageUnload.title'),
          name: 'confirmPageUnload',
          valuePropName: 'checked',
        },
        {
          children: <Switch />,
          desc: t('setting.safetensorsPread.desc'),
          label: t('setting.safetensorsPread.title'),
          name: 'safetensorsPread',
          valuePropName: 'checked',
        },
        {
          children: (
            <Segmented
              options={[
                { label: t('setting.bootSplash.modes.random'), value: 'random' },
                { label: t('setting.bootSplash.modes.custom'), value: 'custom' },
                { label: t('setting.bootSplash.modes.single'), value: 'single' },
                { label: t('setting.bootSplash.modes.off'), value: 'off' },
              ]}
            />
          ),
          desc: t('setting.bootSplash.modeDesc'),
          label: t('setting.bootSplash.modeTitle'),
          name: 'bootSplashMode',
        },
        {
          children: <Select options={BOOT_SCENE_OPTIONS} style={{ minWidth: 220 }} />,
          desc: t('setting.bootSplash.sceneDesc'),
          divider: false,
          hidden: rawSetting.bootSplashMode !== 'single',
          label: t('setting.bootSplash.sceneTitle'),
          name: 'bootSplashScene',
        },
        {
          children: <BootScenesSelect />,
          desc: t('setting.bootSplash.scenesDesc'),
          divider: false,
          hidden: rawSetting.bootSplashMode !== 'custom',
          label: t('setting.bootSplash.scenesTitle'),
          name: 'bootSplashScenes',
        },
      ],

      title: t('setting.tab.appearance'),
    }),
    [
      localeOptions,
      native,
      nativeDraft,
      nativeStatus,
      primaryColor,
      neutralColor,
      paletteMode,
      rawSetting.themeBrightness,
      rawSetting.bootSplashMode,
      rawSetting.logoType,
      rawSetting.logoCustomTitle,
      rawSetting.logoCustomUrl,
      styles,
      t,
      updateDraft,
    ],
  );

  return (
    <Form
      id="theme_settings"
      initialValues={setting}
      items={[theme]}
      onFinish={apply}
      onValuesChange={(changed) => updateDraft(changed)}
      style={{ flex: 1 }}
      variant={'borderless'}
    />
  );
});

export default SettingForm;
