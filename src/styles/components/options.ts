import { Theme, css } from 'antd-style';

export default (token: Theme) => css`
  html #lobe-neo-theme-app .gradio-dropdown .wrap:has(> .wrap-inner) input:focus-visible {
    outline: none !important;
  }
  html #lobe-neo-theme-app .gradio-dropdown:not([id$='_script_container'] *) {
    .wrap:has(> .wrap-inner) {
      min-height: 36px;
      padding: 0 !important;
      border: 1px solid var(--lobe-border) !important;
      border-radius: var(--lobe-radius) !important;
      background: var(--lobe-field) !important;
      &:focus-within {
        border-color: var(--lobe-accent-text) !important;
        box-shadow: none !important;
      }
      input:focus-visible { outline: none !important; }
    }
    .wrap-inner {
      padding: 4px !important;
      gap: 4px !important;
      &:not(:has(.token)) {
        padding: 0 !important;
      }
    }
    input.border-none {
      height: 36px !important;
      padding: 6px 28px 6px 10px !important;
      &:has(+ .remove-all) { padding-inline-end: 54px !important; }
      border: 0 !important;
      border-radius: var(--lobe-radius) !important;
      background: transparent !important;
      box-shadow: none !important;
      line-height: 20px !important;
    }
  }

  .gradio-dropdown:not([id$='_script_container'] *) {
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

    /* Gradio sizes a non-searchable input to its text. Extend the native click
       target beneath the decorative caret so the whole field opens the menu. */
    .secondary-wrap > input,
    #forge_ui_preset input,
    .gradio-dropdown input {
      box-sizing: border-box;
      flex: 1 1 0%;
      width: 100% !important;
      min-width: 0 !important;
      cursor: pointer !important;
      padding-right: 24px;
    }

    .token {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      overflow: hidden;
      min-width: 0;
      max-width: 100%;

      > span {
        min-width: 0;
        overflow-wrap: anywhere;
        white-space: normal !important;
      }

      .token-remove {
        flex-shrink: 0;
      }
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

  .gradio-dropdown:not([id$='_script_container'] *) ul.options,
  .gradio-dropdown:not([id$='_script_container'] *) [role='listbox']:not(input):not(select) {
    /* Gradio only mounts this when open — style it, don't force display forever */
    position: fixed !important;
    z-index: 10000 !important;
    min-width: 0 !important;
    min-height: 0 !important;
    height: auto !important;
    max-height: 320px !important;
    max-width: calc(100vw - 32px) !important;
    overflow-x: hidden !important;
    overflow-y: auto;
    margin: 0 !important;
    padding: 4px !important;
    border: 1px solid ${token.colorBorder} !important;
    border-radius: ${token.borderRadius}px !important;

    background: ${token.colorBgElevated} !important;
    box-shadow: ${token.boxShadow};

    li,
    [role='option'] {
      box-sizing: border-box;
      overflow: hidden !important;
      display: flex !important;
      align-items: flex-start;
      gap: 8px;

      width: 100% !important;
      min-width: 0;
      max-width: 100% !important;
      height: auto !important;
      min-height: 36px !important;
      border: none !important;

      padding: 6px 8px !important;
      border-radius: ${token.borderRadiusSM}px !important;

      line-height: 1.4 !important;
      text-overflow: clip;
      overflow-wrap: anywhere;
      word-break: normal;
      white-space: normal !important;

      /* Prevent children from intercepting click events so dataset.index is always read */
      > * {
        pointer-events: none !important;
      }

      .inner-item {
        flex: 0 0 1em;
        pointer-events: none !important;
      }

      &.selected {
        color: var(--lobe-accent-text) !important;
        background-color: ${token.colorPrimaryBg} !important;
        font-weight: 600 !important;
      }

      &.active:not(.selected) {
        color: ${token.colorText} !important;
        background-color: ${token.colorFillSecondary} !important;
      }

      &:hover {
        color: ${token.colorText} !important;
        background-color: ${token.colorFillSecondary} !important;
      }
    }
  }

  .gradio-dropdown [data-lobe-menu='true'] {
    inset: auto !important;
    top: var(--lobe-menu-top) !important;
    bottom: var(--lobe-menu-bottom) !important;
    left: var(--lobe-menu-left) !important;
    width: var(--lobe-menu-width) !important;
    max-height: var(--lobe-menu-max-height) !important;
    box-sizing: border-box !important;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
  }

  /* Maximum specificity override for Forge Neo's style.css */
  .gradio-dropdown:not([id$='_script_container'] *) ul.options li.item.selected,
  .gradio-dropdown:not([id$='_script_container'] *) [role='listbox'] [role='option'].selected {
    color: var(--lobe-accent-text) !important;
    background-color: ${token.colorPrimaryBg} !important;
    font-weight: 600 !important;
  }
`;
