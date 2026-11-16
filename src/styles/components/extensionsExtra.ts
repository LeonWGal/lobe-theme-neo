import { Theme, css } from 'antd-style';

/** Extra extension skins for Forge Neo installs */
export default (token: Theme) => css`
  /* —— sd-dynamic-prompts —— */
  #sddp-dynamic-prompting {
    margin-block: 8px;

    .gradio-accordion,
    details.accordion {
      margin: 4px 0 !important;
      border: 1px solid var(--lobe-border, ${token.colorBorderSecondary}) !important;
      border-radius: var(--lobe-radius, ${token.borderRadius}px) !important;
      background: var(--lobe-surface, ${token.colorBgContainer}) !important;
    }

    .sddp-warning {
      display: block;
      padding: 8px 12px;
      border: 1px solid ${token.colorWarningBorder};
      border-radius: var(--lobe-radius, ${token.borderRadius}px);
      background: ${token.colorWarningBg};
      color: ${token.colorWarningText} !important;
      font-size: 12px;
      line-height: 1.45;
    }

    .sddp-info {
      display: block;
      padding: 8px 12px;
      border: 1px solid var(--lobe-border, ${token.colorBorderSecondary});
      border-radius: var(--lobe-radius, ${token.borderRadius}px);
      background: ${token.colorFillQuaternary};
      color: var(--lobe-text-muted, ${token.colorTextDescription}) !important;
      font-size: 12px;
      line-height: 1.45;
    }

    .codeblock,
    .codeblock textarea {
      font-family: ${token.fontFamilyCode} !important;
    }

    code,
    pre {
      padding: 2px 6px;
      border: 1px solid var(--lobe-border, ${token.colorBorderSecondary});
      border-radius: ${token.borderRadiusSM}px;
      background: ${token.colorFillTertiary};
      font-family: ${token.fontFamilyCode};
      font-size: 12px;
    }

    pre {
      overflow-x: auto;
      padding: 8px 10px;
    }

    h3,
    h4 {
      margin: 8px 0 4px;
      font-size: 13px;
      font-weight: 600;
      color: var(--lobe-text, ${token.colorText});
    }

    a {
      color: var(--lobe-accent-text, ${token.colorLink});
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  #tab_sddp-wildcard-manager {
    gap: 12px;

    #sddp-wildcard-tree {
      overflow: auto;
      max-height: 64vh;
      padding: 8px;
      border: 1px solid var(--lobe-border, ${token.colorBorderSecondary});
      border-radius: var(--lobe-radius, ${token.borderRadius}px);
      background: var(--lobe-surface, ${token.colorBgContainer});
      font-size: 13px;

      .tree-leaf {
        position: relative;
        margin: 1px 0;
      }

      .tree-leaf-content {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        border-radius: ${token.borderRadiusSM}px;
        cursor: pointer;
        user-select: none;
        transition: background-color 120ms ease, color 120ms ease;

        &:hover {
          background: ${token.colorFillTertiary};
        }
      }

      .tree-expando {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 18px;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        background: ${token.colorFillSecondary};
        color: var(--lobe-text-muted, ${token.colorTextSecondary});
        font-family: ${token.fontFamilyCode};
        font-size: 12px;
        line-height: 1;
        cursor: pointer;

        &.hidden {
          visibility: hidden;
        }
      }

      .tree-leaf-text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--lobe-text, ${token.colorText});
      }

      .tree-child-leaves {
        margin-left: 10px;
        padding-left: 10px;
        border-left: 1px solid var(--lobe-border, ${token.colorBorderSecondary});

        &.hidden {
          display: none;
        }
      }
    }

    #sddp-wildcard-file-editor textarea {
      font-family: ${token.fontFamilyCode} !important;
      font-size: 13px !important;
      line-height: 1.5 !important;
      border-radius: var(--lobe-radius, ${token.borderRadius}px) !important;
    }

    #sddp-wildcard-search textarea,
    #sddp-wildcard-search input {
      border-radius: var(--lobe-radius, ${token.borderRadius}px) !important;
    }
  }

  /* —— z-tipo-extension —— */
  #txt2img_tipo_accordion,
  #img2img_tipo_accordion {
    margin-block: var(--spacing-lg, 12px);

    &.input-accordion .label-wrap.open {
      margin-bottom: 8px;
      padding-bottom: 8px;
    }
  }

  /* —— ADetailer Ultimate —— */
  [id*='_adetailer_ad_main_accordion'] {
    position: relative !important;

    .ad-version-overlay {
      position: absolute !important;
      top: 15px !important;
      right: 48px !important;
      left: auto !important;
      width: fit-content !important;
      max-width: 480px !important;
      z-index: 5 !important;
      pointer-events: none !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: transparent !important;

      p {
        margin: 0 !important;
        padding: 0 !important;
        font-size: 11px !important;
        color: ${token.colorTextSecondary} !important;
        opacity: 0.85 !important;
        white-space: nowrap !important;
        text-align: right !important;
      }

      .ad-guide-open {
        pointer-events: auto !important;
        cursor: pointer !important;
        font-weight: 600 !important;
        color: var(--lobe-accent-text) !important;
        text-decoration: none !important;
        white-space: nowrap !important;

        &:hover {
          color: var(--lobe-accent-text) !important;
          text-decoration: underline !important;
        }
      }
    }

    .ad-tab-count-pill {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-width: 20px !important;
      height: 20px !important;
      margin-left: 0 !important;
      padding: 0 7px !important;
      border-radius: ${token.borderRadiusSM}px !important;
      background: ${token.colorSuccess} !important;
      color: var(--lobe-success-contrast) !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      line-height: 20px !important;
      box-shadow: none !important;
    }

    .gradio-group,
    .gr-group {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
    }

    .gradio-accordion {
      margin: 8px 0 !important;
      padding: 12px 14px !important;
      border: 1px solid ${token.colorBorderSecondary} !important;
      border-radius: ${token.borderRadius}px !important;
      background: ${token.colorBgContainer} !important;
      box-shadow: none !important;
      transition: border-color 0.2s ease !important;

      &:hover {
        border-color: ${token.colorPrimary} !important;
      }

      .label-wrap {
        padding: 2px 0 !important;
        transition: padding 0.2s ease !important;

        &.open {
          padding-bottom: 10px !important;
          margin-bottom: 10px !important;
          border-bottom: 1px dashed ${token.colorBorderSecondary} !important;
        }

        > span:not(.icon) {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: ${token.colorText} !important;
        }
      }
    }

    button.gradio-button {
      height: var(--button-lg-tool-height, 36px) !important;
      min-height: var(--button-lg-tool-height, 36px) !important;
      max-height: var(--button-lg-tool-height, 36px) !important;
      border-radius: ${token.borderRadiusSM}px !important;
      border: 1px solid ${token.colorBorderSecondary} !important;
      background: ${token.colorFillTertiary} !important;
      color: ${token.colorText} !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      padding: 0 12px !important;
      white-space: nowrap !important;
      transition: all 0.15s ease !important;

      &:hover:not(:disabled) {
        background: ${token.colorFillSecondary} !important;
        border-color: ${token.colorPrimary} !important;
        color: var(--lobe-accent-text) !important;
      }
    }

    button[id*='adetailer_ad_preview_btn'],
    button[id*='adetailer_ad_apply_btn'] {
      background: ${token.colorPrimary} !important;
      border-color: ${token.colorPrimary} !important;
      color: var(--lobe-primary-contrast, #ffffff) !important;
      font-weight: 600 !important;

      &:hover:not(:disabled) {
        background: ${token.colorPrimaryHover} !important;
        border-color: ${token.colorPrimary} !important;
        color: var(--lobe-primary-contrast, #ffffff) !important;
      }
    }

    button[id*='adetailer_ad_preset_delete']:hover:not(:disabled),
    button[id*='adetailer_ad_preset_reset']:hover:not(:disabled) {
      border-color: ${token.colorError} !important;
      color: ${token.colorError} !important;
    }

    .ad-preset-save-row {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      margin-top: 8px !important;

      .block.gradio-checkbox {
        margin: 0 !important;
        display: inline-flex !important;
        align-items: center !important;
      }
    }

    .ad-tab-clipboard-row {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      margin-top: 8px !important;
    }

    .ad-preview-status {
      padding: 6px 14px !important;
      border-left: 3px solid ${token.colorWarning} !important;
      border-radius: ${token.borderRadiusSM}px !important;
      background: ${token.colorWarningBg} !important;

      p {
        color: ${token.colorWarningText} !important;
        font-size: 12px !important;
      }
    }

    .ad-section-label,
    .ad-section-label p {
      margin: 8px 0 4px 0 !important;
      padding: 0 !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
      color: ${token.colorTextSecondary} !important;
    }

    .ad-preset-preview {
      margin: 6px 0 !important;
      padding: 8px 12px !important;
      font-size: 12px !important;
      border-left: 3px solid ${token.colorPrimary} !important;
      background: ${token.colorFillQuaternary} !important;
      border-radius: ${token.borderRadiusSM}px !important;
      color: ${token.colorTextSecondary} !important;

      code {
        background: ${token.colorFillTertiary} !important;
        color: ${token.colorText} !important;
      }
    }

    .ad-cn-row {
      background: ${token.colorFillQuaternary} !important;
      border: 1px solid ${token.colorBorderSecondary} !important;
      border-radius: ${token.borderRadius}px !important;
      padding: 12px 14px !important;
      gap: 16px !important;
    }
  }

  /* —— z-tipo-extension (Lobe Workbench & settings skin) —— */
  [id$='_tipo_accordion'] {
    margin: 0 !important;
    border: 1px solid var(--lobe-border, ${token.colorBorderSecondary}) !important;
    border-radius: var(--lobe-radius, ${token.borderRadius}px) !important;
    background: var(--lobe-surface, ${token.colorBgContainer}) !important;

    .gradio-row,
    .gradio-column {
      gap: 8px !important;
      min-width: 0 !important;
    }

    .gradio-group {
      padding: 8px 10px !important;
      border: 1px solid var(--lobe-border, ${token.colorBorderSecondary}) !important;
      border-radius: var(--lobe-radius, ${token.borderRadius}px) !important;
      background: ${token.colorFillQuaternary} !important;
    }

    .gradio-radio .wrap {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 4px !important;
    }

    .gradio-radio label {
      padding: 4px 9px !important;
      font-size: 12px !important;
      border-radius: ${token.borderRadiusSM}px !important;
    }

    .prose,
    .gradio-markdown {
      font-size: 12px !important;
      line-height: 1.45 !important;
      color: ${token.colorTextDescription} !important;
      margin: 2px 0 !important;
    }

    .gradio-html:empty {
      display: none !important;
    }

    .gradio-accordion,
    details.accordion {
      margin: 4px 0 !important;
      border: 1px solid var(--lobe-border, ${token.colorBorderSecondary}) !important;
      border-radius: var(--lobe-radius, ${token.borderRadius}px) !important;
      background: ${token.colorFillQuaternary} !important;
    }

    button.primary {
      border-radius: ${token.borderRadius}px !important;
    }
  }

  /* —— booru-tags-gacha (Booru Tags Lite skin) —— */
  .booru-gacha-container {
    margin: 0 !important;
    color: var(--lobe-text, ${token.colorText}) !important;

    .gacha-status-bar,
    .gacha-stats-banner,
    .gacha-hero,
    .gacha-footer,
    .gacha-preview-col,
    .gacha-gallery-col,
    .gacha-gallery-grid,
    [id^='booru_gacha_gallery_'],
    .gacha-card-actions-row,
    hr {
      display: none !important;
    }

    .sd-ar-panel-compact {
      margin: 0 !important;
      border: 1px solid var(--lobe-border, ${token.colorBorderSecondary}) !important;
      border-radius: var(--lobe-radius, ${token.borderRadius}px) !important;
      background: var(--lobe-surface, ${token.colorBgContainer}) !important;
    }

    .gacha-card,
    .gacha-section,
    .gacha-panel {
      border: 1px solid var(--lobe-border, ${token.colorBorderSecondary}) !important;
      border-radius: var(--lobe-radius, ${token.borderRadius}px) !important;
      background: ${token.colorFillQuaternary} !important;
      padding: 8px 10px !important;
    }

    .gacha-chip,
    .gacha-tag-chip {
      border: 1px solid var(--lobe-border, ${token.colorBorderSecondary}) !important;
      border-radius: ${token.borderRadiusSM}px !important;
      background: var(--lobe-field, ${token.colorBgElevated}) !important;
      color: var(--lobe-text, ${token.colorText}) !important;
    }

    button.primary {
      border-radius: ${token.borderRadius}px !important;
    }

    .gradio-tabs > .tab-nav {
      margin-bottom: 6px !important;
      gap: 4px !important;
    }

    .gradio-row,
    .gradio-column {
      gap: 6px !important;
    }
  }

  #txt2img_script_container .gradio-accordion button.primary,
  #img2img_script_container .gradio-accordion button.primary {
    border-radius: ${token.borderRadius}px !important;
  }
`;
