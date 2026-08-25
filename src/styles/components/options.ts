import { Theme, css } from 'antd-style';

export default (token: Theme) => css`
  .gradio-dropdown {
    overflow: visible !important;

    .wrap,
    input {
      cursor: pointer;
    }

    .wrap {
      overflow: visible !important;

      /* Don't inherit global .wrap { gap } into Gradio dropdown chrome */
      gap: 0 !important;
    }

    /* Multiselect chip row: let it wrap and shrink cleanly */
    .wrap-inner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      min-width: 0 !important;
    }

    .secondary-wrap {
      position: relative;

      display: flex;
      flex: 1;
      align-items: center;

      min-width: 0 !important;
    }

    .token {
      overflow: hidden;
      max-width: 100%;
      text-overflow: ellipsis;
    }

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
      margin: 0 !important;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .container .wrap {
      .wrap-inner input {
        font-size: var(--text-sm);
        line-height: 0;
      }
    }
  }

  .dropdown-arrow {
    flex: none;

    width: 16px !important;
    min-width: 16px !important;
    max-width: 16px !important;
    height: 16px !important;
    min-height: 16px !important;
    max-height: 16px !important;
    margin: 0 !important;
  }

  ul.options {
    /* Gradio only mounts this when open — style it, don't force display forever */
    margin: 0 !important;
    padding: 4px !important;
    border: 1px solid ${token.colorBorder} !important;
    border-radius: ${token.borderRadius}px !important;

    background: ${token.colorBgElevated} !important;
    box-shadow: ${token.boxShadow};

    li {
      overflow: hidden;
      display: block !important;

      padding: 4px 8px !important;
      border-radius: ${token.borderRadiusSM}px !important;

      line-height: 1 !important;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.selected {
        color: ${token.colorText} !important;
        background: ${token.colorFill} !important;
      }

      &.active:not(.selected) {
        color: ${token.colorText} !important;
        background: ${token.colorPrimaryBg} !important;
      }

      &:hover {
        color: ${token.colorText} !important;
        background: ${token.colorFillSecondary} !important;
      }
    }
  }
`;
