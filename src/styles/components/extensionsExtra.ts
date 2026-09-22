import { Theme, css } from 'antd-style';

/** Extra extension skins for Forge Neo installs */
export default (token: Theme) => css`
  /* —— sd-dynamic-prompts —— */
  #sddp-dynamic-prompting {
    margin-block: 8px;

    .sddp-warning {
      color: ${token.colorWarning} !important;
    }

    .sddp-info {
      color: ${token.colorTextDescription} !important;
    }

    .codeblock,
    .codeblock textarea {
      font-family: ${token.fontFamilyCode} !important;
    }
  }

  #tab_sddp-wildcard-manager {
    #sddp-wildcard-tree {
      overflow: auto;

      max-height: 60vh;
      padding: 8px;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadius}px;

      background: ${token.colorBgContainer};
    }

    #sddp-wildcard-file-editor textarea {
      font-family: ${token.fontFamilyCode} !important;
      font-size: 13px !important;
    }

    #sddp-wildcard-search input {
      border-radius: ${token.borderRadius}px;
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
        color: ${token.colorPrimary} !important;
        text-decoration: none !important;
        white-space: nowrap !important;

        &:hover {
          color: ${token.colorPrimaryHover} !important;
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
      color: #ffffff !important;
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
      background: ${token.colorFillQuaternary} !important;
      box-shadow: none !important;
      transition: border-color 0.2s ease !important;

      &:hover {
        border-color: ${token.colorPrimaryHover} !important;
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
        color: ${token.colorPrimary} !important;
      }
    }

    button[id*='adetailer_ad_preview_btn'],
    button[id*='adetailer_ad_apply_btn'] {
      background: ${token.colorPrimary} !important;
      border-color: ${token.colorPrimary} !important;
      color: #121214 !important;
      font-weight: 600 !important;

      &:hover:not(:disabled) {
        background: ${token.colorPrimaryHover} !important;
        border-color: ${token.colorPrimaryHover} !important;
        color: #121214 !important;
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

  /* —— booru-tags-gacha (no stable elem_ids; style sampler-section buttons gently) —— */
  #txt2img_script_container .gradio-accordion button.primary,
  #img2img_script_container .gradio-accordion button.primary {
    border-radius: ${token.borderRadius}px !important;
  }
`;
