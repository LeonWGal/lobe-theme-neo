import { Theme, css } from 'antd-style';

export default (token: Theme) => css`
  .tabitem,
  .gradio-tabitem {
    padding: 16px !important;
    background: ${token.colorBgContainer};
    border: none !important;
    border-radius: ${token.borderRadius}px;
  }

  #tabs {
    > .tabitem.gradio-tabitem {
      background: transparent !important;
    }
  }

  .tab-nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    border: none !important;

    button {
      cursor: pointer;

      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 1 auto;

      min-width: fit-content;
      padding: 6px 14px !important;

      font-size: var(--text-md);
      color: ${token.colorTextSecondary} !important;

      background: ${token.colorFillTertiary} !important;
      border: 1px solid ${token.colorBorderSecondary} !important;
      border-radius: ${token.borderRadiusSM}px !important;

      transition: var(--button-transition);

      &:hover {
        color: ${token.colorText} !important;
        background: ${token.colorFillSecondary} !important;
        border-color: ${token.colorBorder} !important;
      }

      &.selected {
        font-weight: 600;
        color: ${token.colorPrimary} !important;

        background: ${token.colorFillSecondary} !important;
        border: 1px solid ${token.colorPrimary} !important;
      }
    }
  }

  #tab_settings {
    #settings {
      display: flex !important;
      flex-direction: row;
      gap: 16px;

      > div.tab-nav {
        float: none !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch;
        width: 220px !important;
        min-width: 220px !important;
        max-width: 220px !important;
        flex: 0 0 220px !important;

        button {
          width: 100%;
          justify-content: flex-start;
          text-align: left;
          background: transparent !important;
          border: none !important;
          border-radius: ${token.borderRadiusSM}px !important;

          &:hover {
            background: ${token.colorFillTertiary} !important;
          }

          &.selected {
            color: ${token.colorPrimary} !important;
            background: ${token.colorPrimaryBg} !important;
            border: none !important;
          }
        }

        .settings-category {
          text-decoration: none;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          color: ${token.colorTextSecondary};
          padding: 8px 4px 4px 4px;
        }

        #settings_show_all_pages {
          width: 100%;
          background: ${token.colorFillTertiary} !important;
          border: 1px solid ${token.colorBorderSecondary};
          border-radius: ${token.borderRadius}px !important;

          &:hover {
            background: ${token.colorFill} !important;
            border-color: ${token.colorBorder} !important;
          }
        }
      }

      > div:not(.tab-nav) {
        float: none !important;
        margin-left: 0 !important;
        flex: 1 1 auto !important;
        min-width: 0 !important;
      }
    }

    .tabitem {
      margin-left: 0 !important;
    }

    #settings_search {
      margin: 0 0 var(--spacing-xl);
    }
  }
`;
