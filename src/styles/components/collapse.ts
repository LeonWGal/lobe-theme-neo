import { Theme, css } from 'antd-style';

export default (token: Theme) => css`
  html[data-lobe-lite-effects='false'] #lobe-neo-theme-app
    :is(.gradio-accordion, .input-accordion, details.accordion):is([open], :has(> .label-wrap.open)) {
    background: color-mix(in srgb, var(--lobe-surface) 84%, transparent) !important;
    position: relative;
    isolation: isolate;
    &::before {
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: inherit;
      backdrop-filter: saturate(130%) blur(10px);
      pointer-events: none;
      content: '';
    }
  }
  html #lobe-neo-theme-app {
    .gradio-accordion,
    .input-accordion,
    details.accordion {
      min-width: 0 !important;
      padding: 6px 12px !important;
      border: 1px solid var(--lobe-border) !important;
      border-radius: var(--lobe-radius) !important;
      background: var(--lobe-surface) !important;
      box-shadow: none !important;
      color: var(--lobe-text);
      transition: border-color 120ms ease;

      &:has(> .label-wrap:focus-visible, > summary:focus-visible) {
        border-color: var(--lobe-accent-text) !important;
        outline: 2px solid var(--lobe-accent-text) !important;
        outline-offset: 2px !important;
      }

      > .label-wrap:focus-visible,
      > summary:focus-visible,
      .input-accordion-checkbox:focus-visible {
        outline: none !important;
      }

      > .label-wrap,
      > summary {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        min-height: 28px;
        padding: 0 !important;
        margin: 0 !important;
        color: var(--lobe-text) !important;
        cursor: pointer;
        list-style: none;
        transition: color 120ms ease;
      }
      > .label-wrap > span:not(.icon) {
        display: flex;
        align-items: center;
        flex: 1;
        gap: 8px;
        min-width: 0;
        font-family: ${token.fontFamily};
        font-size: var(--lobe-type-ui) !important;
        font-weight: 500 !important;
        line-height: var(--lobe-leading-ui) !important;
        white-space: normal;
        overflow-wrap: anywhere;
        &::before {
          display: none !important;
        }
      }
      > .label-wrap > .icon {
        display: grid;
        place-items: center;
        flex: 0 0 16px;
        width: 16px;
        height: 16px;
        margin: 0 !important;
        font-size: 0 !important;
        line-height: 0 !important;
        color: var(--lobe-text-muted);
        transform: rotate(-90deg) !important;
        transition: transform 120ms ease;
        &::before {
          content: '';
          width: 7px;
          height: 7px;
          border-right: 1.5px solid currentColor;
          border-bottom: 1.5px solid currentColor;
          transform: rotate(45deg) translate(-1px, -1px);
        }
      }
      > .label-wrap.open,
      &[open] > summary {
        padding-bottom: 6px !important;
        margin-bottom: 6px !important;
        border-bottom: 1px solid var(--lobe-border) !important;
      }
      > .label-wrap.open > .icon {
        transform: none !important;
      }
      .input-accordion-checkbox {
        margin: 0 !important;
      }
      .input-accordion-extra {
        display: inline-flex;
        align-items: center;
        flex: 0 0 auto !important;
        margin-left: auto;
        padding-left: 8px;
        font-size: 12px;
        color: var(--lobe-text-muted);
      }
      .tab-nav button.selected,
      label.selected {
        color: var(--lobe-accent-text) !important;
      }
    }
    .accordions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  }
`;
