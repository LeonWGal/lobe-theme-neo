import { Theme, css } from 'antd-style';

import { ChevronLeft, ChevronRight, iconMask } from '@/icons/native';

export default (token: Theme) => css`
  html, body, gradio-app, #lobe-neo-theme-app {
    background-color: ${token.colorBgLayout};
  }
  html, body { min-height: 100%; }
  #lobe-neo-theme-app {
    min-height: 100dvh;
    color: var(--lobe-text);
  }
  /* Forge sets overflow-x:hidden on body, which computes overflow-y:auto.
     Its content-height body then traps wheel chaining and sticky positioning. */
  html[data-lobe-forge='true'] body {
    overflow-x: clip !important;
    overflow-y: visible;
    overscroll-behavior: auto;
  }
  html[data-lobe-forge='true'] {
    overflow-x: clip;
    scroll-padding-top: 76px;
  }
  .lobe-app-header {
    position: fixed !important;
    inset: 0 0 auto !important;
    z-index: 999;
    height: 64px;
    background: color-mix(in srgb, ${token.colorBgLayout} 65%, transparent);
    backdrop-filter: saturate(150%) blur(12px) !important;
    -webkit-backdrop-filter: saturate(150%) blur(12px) !important;
    > section {
      background: transparent;
    }
  }
  .lobe-app-main {
    padding-top: 64px;
  }
  .lobe-header-row {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: clamp(4px, 1vw, 12px);
    width: 100%;
    height: 100%;
    padding-inline: clamp(8px, 2vw, 24px);
    font-family: ${token.fontFamily};
  }
  .lobe-header-brand { max-width: min(22vw, 220px); overflow: hidden; }
  .lobe-header-brand a { max-width: 100%; }
  .lobe-custom-logo-title {
    display: block;
    max-width: clamp(72px, 14vw, 155px);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .lobe-header-nav, .lobe-header-tabs { min-width: 0; }
  .lobe-header-navigation { display: flex; align-items: center; gap: 6px; min-width: 0; }
  .lobe-header-tabs {
    display: flex;
    flex: 1;
    gap: 2px;
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--lobe-border) transparent;
    padding: 4px;
  }
  .lobe-header-tab {
    position: relative;
    flex: none;
    min-height: 40px;
    padding: 4px 12px 8px;
    border: 0;
    border-radius: ${token.borderRadius}px;
    background: transparent;
    color: var(--lobe-text-muted);
    font: 600 var(--lobe-type-ui)/var(--lobe-leading-ui) var(--lobe-font-family);
    white-space: nowrap;
    cursor: pointer;
    &:hover { background: ${token.colorFillTertiary}; color: var(--lobe-text); }
    &:focus-visible { outline-offset: -2px !important; }
    &[aria-current='page'] {
      color: var(--lobe-accent-text);
      background: ${token.colorFillQuaternary};
      &::after {
        position: absolute;
        inset: auto 6px 2px;
        height: 3px;
        border-radius: 2px;
        background: var(--lobe-accent-text);
        content: '';
      }
    }
  }
  .lobe-header-actions { justify-self: end; }
  @media (max-width: 899px) {
    .lobe-header-row {
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-rows: 32px minmax(0, 1fr);
      gap: 0 6px;
    }
    .lobe-header-brand { max-width: 100%; }
    .lobe-header-nav { grid-area: 2 / 1 / 3 / -1; }
    .lobe-header-actions { grid-area: 1 / 2; }
    .lobe-header-tabs { padding: 2px 4px; }
    .lobe-header-tab { min-height: 27px; padding: 2px 9px 5px; }
  }
  .lobe-sidebar-heading {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) 32px;
    align-items: center;
    flex-shrink: 0;
    gap: 4px;
    padding: 3px 8px;
    border-bottom: 1px solid var(--lobe-border);
    color: var(--lobe-text);
    > strong {
      grid-area: 1 / 2;
      overflow: hidden;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--lobe-type-ui);
      font-weight: 600;
    }
    > .lobe-sidebar-pin { grid-area: 1 / 1; }
    > .lobe-sidebar-close { grid-area: 1 / 3; }
  }
  .lobe-sidebar-left .lobe-sidebar-heading {
    > .lobe-sidebar-pin { grid-area: 1 / 3; }
    > .lobe-sidebar-close { grid-area: 1 / 1; }
  }
  .lobe-prompt-picker-heading {
    color: var(--lobe-text-muted);
    font-size: var(--lobe-type-meta);
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: -8px;
  }
  .lobe-app-sidebar {
    position: sticky !important;
    top: 64px !important;
    align-self: flex-start;
    height: calc(100dvh - 64px);
    max-height: calc(100dvh - 64px);
    min-height: 0;
    overflow: visible;
  }
  aside.lobe-sidebar-panel,
  .lobe-sidebar-panel-inner {
    height: var(--lobe-sidebar-height, calc(100dvh - 64px));
    min-height: 0;
    max-height: var(--lobe-sidebar-height, calc(100dvh - 64px));
  }
  .lobe-extra-network-body {
    flex: 1 1 0;
    min-height: 0;
    overscroll-behavior-y: contain !important;
  }
  aside.lobe-sidebar-panel {
    background: transparent !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    .lobe-sidebar-toggle,
    .lobe-sidebar-resize {
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
    }
    .lobe-sidebar-toggle > button {
      background: ${token.colorBgContainer} !important;
      border: 1px solid ${token.colorBorderSecondary} !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      svg {
        display: none;
      }
      &::after {
        display: block;
        width: 14px;
        height: 14px;
        background: currentColor;
        mask: var(--lobe-sidebar-chevron) center / contain no-repeat;
        content: '';
      }
    }
    &.lobe-sidebar-left { --lobe-sidebar-chevron: ${iconMask(ChevronLeft)}; }
    .lobe-sidebar-toggle > button {
      display: grid;
      place-items: center;
      box-sizing: border-box;
      width: 22px;
      min-width: 22px !important;
      height: 42px;
      padding: 0;
      color: var(--lobe-text-muted) !important;
      border-radius: var(--lobe-radius-sm) !important;
      &:hover, &:focus-visible { color: var(--lobe-accent-text) !important; }
    }
    &.lobe-sidebar-left .lobe-sidebar-toggle > button {
      border-radius: 0 var(--lobe-radius-sm) var(--lobe-radius-sm) 0 !important;
    }
    &.lobe-sidebar-right .lobe-sidebar-toggle > button {
      border-radius: var(--lobe-radius-sm) 0 0 var(--lobe-radius-sm) !important;
    }
    &.lobe-sidebar-right { --lobe-sidebar-chevron: ${iconMask(ChevronRight)}; }
    &.lobe-sidebar-left.lobe-sidebar-hidden,
    &.lobe-sidebar-left:has(.lobe-sidebar-content[inert]) {
      --lobe-sidebar-chevron: ${iconMask(ChevronRight)};
    }
    &.lobe-sidebar-right.lobe-sidebar-hidden,
    &.lobe-sidebar-right:has(.lobe-sidebar-content[inert]) {
      --lobe-sidebar-chevron: ${iconMask(ChevronLeft)};
    }
  }
  .lobe-sidebar-edge-button {
    position: fixed;
    z-index: 51;
    top: 50%;
    display: grid;
    place-items: center;
    width: 22px;
    min-width: 22px !important;
    height: 42px;
    padding: 0;
    transform: translateY(-50%);
    color: ${token.colorTextSecondary};
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorderSecondary};
    cursor: pointer;
    &.lobe-sidebar-left {
      left: 0;
      border-radius: 0 var(--lobe-radius-sm) var(--lobe-radius-sm) 0;
    }
    &.lobe-sidebar-right {
      right: 0;
      border-radius: var(--lobe-radius-sm) 0 0 var(--lobe-radius-sm);
    }
    &:hover, &:focus-visible {
      color: ${token.colorPrimary};
      background: ${token.colorFillSecondary};
    }
  }
  aside.lobe-sidebar-float {
    position: fixed !important;
    top: var(--draggable-panel-header-height, 64px);
    bottom: 0;
    height: var(--lobe-sidebar-height, calc(100dvh - 64px)) !important;
    transition: transform var(--lobe-motion-panel) var(--lobe-motion-out) !important;
    &.lobe-sidebar-left {
      left: 0;
      right: auto;
      &.lobe-sidebar-hidden {
        transform: translateX(-100%);
      }
    }
    &.lobe-sidebar-right {
      right: 0;
      left: auto;
      &.lobe-sidebar-hidden {
        transform: translateX(100%);
      }
    }
    &.lobe-sidebar-hidden {
      pointer-events: none;
      > .lobe-sidebar-toggle {
        opacity: 1 !important;
      }
      .lobe-sidebar-toggle > button {
        pointer-events: auto;
        svg {
          transform: rotate(0deg) !important;
        }
      }
    }
    > div:not(.lobe-sidebar-toggle),
    .lobe-sidebar-panel-inner {
      transition: none !important;
    }
  }
  html[data-lobe-lite-effects='false'] aside.lobe-sidebar-float:not(.lobe-sidebar-hidden) .lobe-sidebar-content {
    background: color-mix(in srgb, var(--lobe-surface) 86%, transparent) !important;
    position: relative;
    isolation: isolate;
    &::before {
      position: absolute;
      inset: 0;
      z-index: -1;
      backdrop-filter: saturate(120%) blur(10px);
      pointer-events: none;
      content: '';
    }
  }
  aside.lobe-sidebar-overlay {
    z-index: 1001;
    width: min(var(--lobe-sidebar-width, 280px), calc(100vw - 24px));
    max-width: calc(100vw - 24px);
    border: 0 !important;
    > div:not(.lobe-sidebar-toggle),
    .lobe-sidebar-panel-inner {
      width: 100% !important;
    }
    .lobe-sidebar-toggle,
    .lobe-sidebar-pin {
      display: none !important;
    }
  }
  .lobe-sidebar-mask {
    position: fixed;
    inset: 64px 0 0;
    z-index: 1000;
    width: 100%;
    height: auto;
    padding: 0;
    border: 0;
    background: ${token.colorBgMask};
    &[hidden] {
      display: none;
    }
  }
  html[data-lobe-resizing='true'] aside.lobe-sidebar-panel,
  html[data-lobe-resizing='true'] aside.lobe-sidebar-panel > div,
  html[data-lobe-resizing='true'] .lobe-sidebar-panel-inner {
    transition: none !important;
  }
  .lobe-sidebar-edge {
    position: fixed;
    z-index: 51;
    bottom: 0;
    width: 8px;
    background: transparent;
    &.lobe-sidebar-left {
      left: 0;
    }
    &.lobe-sidebar-right {
      right: 0;
    }
  }
`;
