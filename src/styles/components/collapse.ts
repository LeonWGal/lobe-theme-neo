import { Theme, css } from 'antd-style';

export default (token: Theme) => {
  return css`
    .label-wrap {
      transition: padding 400ms ${token.motionEaseOut};

      > span:not(.icon) {
        display: flex;
        gap: 8px;
        align-items: center;

        font-size: var(--text-md);
        font-weight: 600;
        line-height: 1;

        transition: color 400ms ${token.motionEaseOut};

        &::before {
          content: '';

          display: block;

          width: 8px;
          height: 8px;

          background: ${token.colorPrimary};
          border-radius: 4px;
        }
      }

      &.open,
      details[open] > & {
        padding-bottom: 16px;
        border-bottom: 1px dashed ${token.colorBorderSecondary};

        span {
          color: ${token.colorText};
        }
      }
    }

    /* Forge Neo InputAccordion & general accordions */
    div.accordions > div.input-accordion,
    .input-accordion,
    details.input-accordion,
    details.accordion {
      min-width: fit-content !important;
      border: 1px solid ${token.colorBorderSecondary} !important;
      border-radius: ${token.borderRadius}px !important;
      background: ${token.colorFillQuaternary} !important;
      color: ${token.colorText} !important;
      transition: all 0.2s ease;

      .label-wrap,
      summary {
        color: ${token.colorText} !important;
        cursor: pointer;
      }

      &.input-accordion-open,
      &[open] {
        border-color: ${token.colorPrimary} !important;
        background: ${token.colorBgContainer} !important;

        .label-wrap,
        summary {
          color: ${token.colorText} !important;
        }
      }

      .input-accordion-checkbox {
        vertical-align: middle;
        margin-right: 8px;
      }

      .input-accordion-extra {
        display: inline-flex;
        align-items: center;
        flex: 0 0 auto !important;
        margin-left: auto;
        padding-left: 12px;
        font-size: var(--text-sm);
        color: ${token.colorTextSecondary};
      }
    }

    div.accordions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    /* Selected items inside accordions in both light and dark themes */
    .input-accordion,
    .gradio-accordion,
    details.accordion {
      .tab-nav button.selected {
        color: ${token.colorPrimary} !important;
        background-color: ${token.colorPrimaryBg} !important;
        border-color: ${token.colorPrimary} !important;
      }

      label.selected {
        color: ${token.colorPrimary} !important;
        background-color: ${token.colorPrimaryBg} !important;
        border-color: ${token.colorPrimary} !important;
      }
    }
  `;
};
