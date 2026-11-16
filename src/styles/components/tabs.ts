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
        color: var(--lobe-accent-text) !important;

        background: ${token.colorFillSecondary} !important;
        border: 1px solid ${token.colorPrimary} !important;
      }
    }
  }

  #tab_settings {
    container: lobe-settings / inline-size;

    #settings {
      display: grid !important;
      grid-template-columns: minmax(176px, 220px) minmax(0, 1fr);
      align-items: start;
      gap: 16px;

      /* Forge inserts an empty Group before each settings page. */
      > .gradio-group:has(> .styler:only-child:empty) {
        display: none !important;
      }

      > div.tab-nav {
        float: none !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch;
        grid-column: 1;
        grid-row: 1 / span 1024;
        width: 100% !important;
        min-width: 0 !important;
        max-width: none !important;
        padding: 0 !important;

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
            color: var(--lobe-accent-text) !important;
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
        grid-column: 2;
        width: 100% !important;
        min-width: 0 !important;
        padding: 16px !important;
      }
    }

    .tabitem {
      margin-left: 0 !important;
    }

    #settings_search {
      margin: 0 0 var(--spacing-xl);
    }

    @container lobe-settings (max-width: 600px) {
      #settings {
        grid-template-columns: minmax(0, 1fr);

        > div.tab-nav {
          grid-row: auto;
          flex-direction: row !important;
          flex-wrap: nowrap;
          overflow-x: auto;
          max-width: 100% !important;
          padding-bottom: 8px !important;

          button {
            flex: 0 0 auto;
            width: auto;
            white-space: nowrap;
          }

          .settings-category {
            display: none;
          }
        }

        > div:not(.tab-nav) {
          grid-column: 1;
        }
      }
    }
  }
`;
