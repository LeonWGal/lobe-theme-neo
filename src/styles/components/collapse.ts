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

    /* Forge Neo InputAccordion */
    .input-accordion,
    div.accordions > div.input-accordion {
      min-width: fit-content !important;

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
  `;
};
