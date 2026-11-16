import { Theme, css } from 'antd-style';

export default (token: Theme) => css`
  .lobe-inline-icon {
    display: inline-flex;
    flex: 0 0 auto;
    vertical-align: -0.18em;
    pointer-events: none;
    &:not(:last-child) { margin-inline-end: 4px; }
  }
  .lobe-history-task button[aria-pressed='true'],
  .lobe-queue-panel button[aria-pressed='true'],
  .lobe-inline-queue button[aria-pressed='true'] {
    color: var(--lobe-accent-text);
    background: var(--lobe-field);
  }
  html,
  body,
  #__next,
  .ant-app {
    position: relative;

  }

  /* The Lobe modal viewport passes pointer events through to its popup and controls. */
  .lobe-modal__wrapper > :is(.ant-select-dropdown, .ant-dropdown, .ant-popover, .ant-tooltip) {
    pointer-events: auto;
  }

  .lobe-settings-body {
    color: var(--lobe-text);

    .lobe-autocomplete-settings {
      width: 100%;
      min-width: 0;
      .ant-form-item-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        align-items: center;
        @container lobe-settings (max-width: 620px) { grid-template-columns: minmax(0, 1fr); }
      }
      .ant-form-item-label, .ant-form-item-control { width: 100%; max-width: none; }
      .ant-form-item-control-input-content { display: flex; justify-content: flex-end; min-width: 0; }
      @container lobe-settings (max-width: 620px) {
        .ant-form-item-control-input-content { justify-content: flex-start; }
      }
      .ant-form-item-label > label { color: var(--lobe-text); }
      .ant-segmented { max-width: 100%; }
      .ant-segmented-group { flex-direction: row; flex-wrap: wrap; }
    }
    & :is(.ant-select, .ant-input-number) {
      color: var(--lobe-text);
      background: var(--lobe-surface);
      border-color: var(--lobe-color-border);
      box-shadow: none !important;
      &:focus-within {
        border-color: var(--lobe-accent-text) !important;
      }
      input:focus-visible { outline: none !important; }
    }
    .ant-select :is(.ant-select-selector, .ant-select-content, .ant-select-selection-item),
    .ant-input-number .ant-input-number-input {
      color: var(--lobe-text);
      background: transparent !important;
    }
    .ant-select :is(.ant-select-placeholder, .ant-select-arrow) { color: var(--lobe-text-muted); }
  }
  .ant-select-input:focus-visible,
  .ant-select-selection-search-input:focus-visible,
  .ant-input-number-input:focus-visible,
  .ant-input-affix-wrapper .ant-input:focus-visible {
    outline: none !important;
  }
  .lobe-settings-popup .ant-select-dropdown {
    color: var(--lobe-text);
    background: var(--lobe-surface);
    border: 1px solid var(--lobe-border);
    .ant-select-item { color: var(--lobe-text); }
    & :is(.ant-select-item-option-active, .ant-select-item-option-selected):not(.ant-select-item-option-disabled) {
      color: var(--lobe-text);
      background: var(--lobe-field);
    }
    .ant-select-item-option-disabled { color: var(--lobe-text-muted); opacity: 0.65; }
  }

  .lobe-quick-body,
  .lobe-extra-network-body {
    overscroll-behavior-y: auto;
    scrollbar-width: thin;
    scrollbar-color: ${token.colorFillSecondary} transparent;
    &::-webkit-scrollbar { width: 6px; height: 6px; }
    &::-webkit-scrollbar-thumb { background: ${token.colorFillSecondary}; border-radius: 6px; }
    &::-webkit-scrollbar-track { background: transparent; }
  }

  .ant-slider-track,
  .ant-tabs-ink-bar,
  .ant-switch-checked {
    background: ${token.colorPrimary} !important;
  }

  .ant-btn-primary:not(.ant-btn-dangerous) {
    color: var(--lobe-primary-contrast);
    background: ${token.colorPrimary};

    &:hover {
      color: var(--lobe-primary-hover-contrast) !important;
      background: ${token.colorPrimaryHover} !important;
    }

    &:active {
      color: var(--lobe-primary-active-contrast) !important;
      background: ${token.colorPrimaryActive} !important;
    }
  }
`;
