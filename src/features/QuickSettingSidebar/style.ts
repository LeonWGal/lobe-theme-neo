import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css }) => ({
  container: css`
    flex: 1;
    min-height: 0;

    .lobe-quick-tabs {
      width: 100%;
      padding: 3px;
      background: var(--lobe-field);
      border: 1px solid var(--lobe-border);
      border-radius: var(--lobe-radius);
      .ant-segmented-item { min-width: 0; color: var(--lobe-text-muted); }
      .ant-segmented-item-label { padding-inline: 6px; font-weight: 500; }
      .ant-segmented-item-selected {
        background: var(--lobe-surface);
        box-shadow: none;
      }
    }

    /* Model names follow the actual sidebar width, including while resizing. */
    ul.options > li {
      max-width: 100% !important;
    }

    #quicksettings {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: stretch;
      gap: 9px !important;
      padding: 0 !important;

      width: 100%;

      > *:not(#forge_refresh_checkpoint) {
        flex: 0 0 auto;

        width: 100% !important;
        min-width: unset !important;
        max-width: unset !important;
        margin: 0;
        padding: 0;
      }

      #forge_ui_preset {
        width: 100% !important;

        input {
          width: 100% !important;
          min-width: 0 !important;
          cursor: pointer !important;
        }
      }

      #forge_refresh_checkpoint {
        flex: none !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: none !important;
        height: var(--button-lg-tool-height) !important;
        align-self: stretch;
        margin: 0 !important;
      }

      .gradio-dropdown .wrap {
        border: 1px solid var(--lobe-border) !important;
        border-radius: var(--lobe-radius) !important;
        box-shadow: none !important;
      }

      .gradio-dropdown .token {
        border-radius: var(--lobe-radius-sm);
      }

      .head > label {
        min-width: unset;
        max-width: 60%;
        margin-right: 12px;
      }

      input[type='color'] {
        width: 100%;
      }

      input[type='number'],
      textarea {
        resize: none;
        box-sizing: border-box;
        height: 28px !important;
        padding: 4px !important;
      }

      textarea {
        width: 100%;
      }

      /* Only truncate label/info text — never icon-wrap / caret spans */
      .label-wrap > span,
      span[data-testid='block-info'],
      .single-select {
        overflow: hidden;
        max-width: 100%;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Gradio 4: caret lives in .icon-wrap > svg.dropdown-arrow[width=100%].
           Cap the wrap or the SVG becomes a giant sidebar-width triangle. */
      .icon-wrap {
        pointer-events: none !important;

        position: absolute !important;
        top: 50% !important;
        right: 8px !important;
        transform: translateY(-50%) !important;

        display: flex !important;
        flex: none !important;
        align-items: center;
        justify-content: center;

        width: 16px !important;
        min-width: 16px !important;
        max-width: 16px !important;
        height: 16px !important;
        min-height: 16px !important;
        max-height: 16px !important;
        margin: 0 !important;
      }

      .dropdown-arrow {
        flex: none;

        width: 16px !important;
        min-width: 16px !important;
        max-width: 16px !important;
        height: 16px !important;
        min-height: 16px !important;
        max-height: 16px !important;
      }

      .wrap-inner {
        min-width: 0 !important;
      }

      .secondary-wrap {
        position: relative;
        min-width: 0 !important;
      }

      div.gradio-dropdown {
        overflow: visible !important;
        min-width: unset !important;
      }
    }

    html[data-lobe-forge='true'] & .lobe-quick-body #quicksettings #forge_refresh_checkpoint {
      width: 100% !important;
      min-width: 0 !important;
      max-width: none !important;
      transform: none !important;
    }

    #quicksettings .wrap-inner input,
    #quicksettings .single-select {
      border: none !important;
      box-shadow: none !important;
      background: transparent !important;
      &:focus-visible { outline: none !important; }
    }
  `,
}));
