import { Theme, css } from 'antd-style';

export default (token: Theme) => css`
  .generate-box > button[id$='_generate']::before,
  .generate-box > button[id$='_generate']::after {
    content: none !important;
  }

  /* Forge overlays Stop/Skip without hiding Generate. Preserve its layout while removing its paint and hit target. */
  .generate-box:has(
      .generate-box-interrupt[style*='display:']:not([style*='display: none']),
      .generate-box-interrupting[style*='display:']:not([style*='display: none']),
      .generate-box-skip[style*='display:']:not([style*='display: none'])
    )
    > button[id$='_generate'] {
    visibility: hidden !important;
    pointer-events: none !important;
  }
  .generate-box > .generate-box-interrupt,
  .generate-box > .generate-box-interrupting,
  .generate-box > .generate-box-skip {
    z-index: 1;
    top: 0;
    bottom: 0;
  }
  button {
    cursor: pointer;
    min-width: fit-content !important;

    &.gradio-button {
      &.tool:not(.hidden) {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 36px;
        min-width: 36px !important;
        max-width: 36px !important;
        height: var(--button-lg-tool-height);
        min-height: var(--button-lg-tool-height) !important;
        max-height: var(--button-lg-tool-height);
        padding: 0;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadius}px;

        font-size: var(--text-md);
        line-height: 1;

        background: ${token.colorFillSecondary};

        &:hover {
          background: ${token.colorFill};
        }

        &.secondary,
        &.primary {
          overflow: hidden;
          flex: 1;

          font-size: var(--text-md);
          line-height: 1;
          text-overflow: ellipsis;

          &:active {
            box-shadow: ${token.boxShadowSecondary};
          }
        }
      }

      &.secondary {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadius}px !important;
        font-weight: 500;
        background: ${token.colorFillTertiary};

        &:hover {
          border-color: ${token.colorBorder};
          color: ${token.colorText};
          background: ${token.colorFill};
        }
      }

      &:not(.tool) {
        &.primary,
        &.secondary {
          &.lg {
            height: var(--button-lg-height) !important;
            min-height: var(--button-lg-height) !important;
            max-height: var(--button-lg-height) !important;
          }
        }
      }

      &[id$='_generate'] {
        height: var(--button-lg-height) !important;
        min-height: var(--button-lg-height) !important;
        max-height: var(--button-lg-height) !important;
        border-radius: ${token.borderRadius}px !important;

        font-weight: 500 !important;

      }

      &[id$='_enqueue'] {
        height: var(--button-lg-height) !important;
        min-height: var(--button-lg-height) !important;
        max-height: var(--button-lg-height) !important;
        border-radius: ${token.borderRadius}px !important;

        font-weight: 500 !important;
        color: var(--lobe-text) !important;
        border: 1px solid var(--lobe-border) !important;
        background: var(--lobe-surface) !important;
        &:hover { background: var(--lobe-field) !important; }

        box-shadow: none !important;
      }

      /* Forge Neo added an 'Interrupting...' button state during interrupt */
      &[id$='_interrupt'],
      &[id$='_interrupting'] {
        min-width: 0;
        border: 1px solid ${token.colorError};
        border-right: none !important;
        border-radius: ${token.borderRadius}px 0 0 ${token.borderRadius}px !important;

        color: var(--button-cancel-text-color) !important;

        background: ${token.colorError} !important;

        &:hover,
        &:active {
          border: 1px solid ${token.colorErrorHover};
          background: ${token.colorErrorHover} !important;
        }
      }

      &[id$='_skip'] {
        min-width: 0;
        border-radius: 0 ${token.borderRadius}px ${token.borderRadius}px 0 !important;
        background: ${token.colorBorderSecondary} !important;

        &:hover,
        &:active {
          background: ${token.colorBorder} !important;
        }
      }

      &#interrogate,
      &#deepbooru {
        height: auto !important;
        max-height: fit-content !important;

        font-size: 14px;
        line-height: inherit;
        white-space: break-spaces;
      }
    }
  }

  div[id^='image_buttons_'] {
    display: flex !important;
    flex-wrap: wrap;
    gap: 6px !important;
    margin-top: 8px !important;

    button.gradio-button.tool {
      flex: 1 1 36px;
      min-width: 36px !important;
      max-width: max(36px, 100%) !important;
      height: var(--button-lg-tool-height) !important;
      border-radius: ${token.borderRadiusSM}px !important;
      font-size: var(--text-md) !important;
    }
  }
`;
