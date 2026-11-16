import { Theme, css, keyframes } from 'antd-style';

const arrive = keyframes`
  from { opacity: .45; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default (token: Theme) => css`
  .progress-container { flex-direction: column; }

  .eta-bar {
    overflow: hidden;
    border: 1px solid var(--lobe-border);
    border-radius: var(--lobe-radius);
    background: var(--lobe-surface) !important;
    opacity: 1 !important;
  }

  .progressDiv,
  .progress-bar-wrap {
    --generation-accent: ${token.colorPrimary};
    position: relative !important;
    top: 0 !important;
    overflow: hidden;
    min-height: 28px;
    background: var(--lobe-surface) !important;
    border: 1px solid var(--lobe-border);
    border-radius: var(--lobe-radius-sm) !important;

    &:has(~ .progressDiv) { display: none !important; }

    > .progress,
    > .progress-bar,
    > .progress-level-inner,
    > div[role='progressbar'] {
      position: relative;
      display: block;
      box-sizing: border-box;
      height: 26px;
      padding: 0 8px 3px;
      text-align: start;
      white-space: nowrap;
      overflow: visible;
      font: 600 var(--lobe-type-meta)/23px var(--lobe-font-family);
      font-variant-numeric: tabular-nums;
      color: var(--lobe-text) !important;
      text-shadow: none !important;
      background: transparent !important;
      transition: width 380ms cubic-bezier(.2,.75,.25,1);

      &::after {
        content: '';
        position: absolute;
        inset: auto 0 0;
        height: 3px;
        border-radius: 0 3px 0 0;
        background: var(--generation-accent);
        box-shadow: 0 -2px 10px color-mix(in srgb, var(--generation-accent) 45%, transparent);
        pointer-events: none;
      }
    }
  }

  :is(#txt2img_gallery, #img2img_gallery) .livePreview {
    inset: 0;
    display: grid;
    place-items: center;
    border-color: color-mix(in srgb, ${token.colorPrimary} 35%, var(--lobe-border)) !important;
    background: var(--lobe-surface) !important;
    > img { inset: 0; width: 100%; height: 100%; cursor: zoom-in; }
    > img:not(:last-of-type) { visibility: hidden; }
  }

  .lobe-live-expand,
  .lobe-live-viewer > header > button {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    padding: 0;
    color: var(--lobe-text);
    background: var(--lobe-surface);
    border: 1px solid var(--lobe-border);
    border-radius: var(--lobe-radius-sm);
    cursor: pointer;
    &:hover { color: var(--lobe-accent-text); border-color: var(--lobe-accent-text); }
    &:focus-visible { outline: 2px solid var(--lobe-accent-text); outline-offset: 2px; }
  }

  .lobe-live-expand {
    position: absolute;
    inset: 10px 10px auto auto;
    z-index: 301;
  }

  .lobe-inline-queue {
    min-width: 0;
    margin-block: 0;
  }
  .lobe-inline-queue-content {
    width: 100%;
    min-width: 0;
    .lobe-queue-actions > button {
      min-width: 0 !important;
      min-height: 36px;
      color: var(--lobe-text);
      background: var(--lobe-surface);
      border-color: var(--lobe-border);
      &:first-child { flex: 1; }
      &:last-child { inline-size: 36px; }
      &:hover, &:focus-visible {
        color: var(--lobe-accent-text);
        border-color: var(--lobe-accent-text);
      }
    }
    .lobe-queue-status {
      display: flex;
      justify-content: space-between;
      gap: 6px;
      min-width: 0 !important;
      padding-inline: 6px;
      color: var(--lobe-text-muted);
      font-variant-numeric: tabular-nums;
      &:hover { color: var(--lobe-accent-text); background: var(--lobe-field); }
      > span:first-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    }
  }
  .lobe-queue-count {
    padding-inline: 6px;
    border-radius: var(--lobe-radius-sm);
    background: var(--lobe-field);
    color: var(--lobe-text);
  }
  .lobe-queue-strip {
    display: flex;
    gap: 5px;
    padding: 2px;
    overflow-x: auto;
    scrollbar-width: thin;
  }
  .lobe-inline-task {
    align-items: center;
    min-width: 0;
    > span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  }
  .lobe-queue-panel {
    min-width: 0;
    width: 100%;
    padding-block: 8px;
    color: var(--lobe-text);
    h2 { margin: 0; color: inherit; font-size: 18px; }
    p { margin: 4px 0 0; color: var(--lobe-text-muted); }
  }
  .lobe-queue-settings {
    border-block: 1px solid var(--lobe-border);
  }
  .lobe-queue-setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
    padding-block: 10px;
    &:not(:last-child) { border-bottom: 1px solid var(--lobe-border); }
    label { color: var(--lobe-text); }
    .ant-select {
      width: min(220px, 100%);
    }
  }
  .lobe-queue-task {
    padding: 10px;
    border: 1px solid var(--lobe-border);
    border-radius: var(--lobe-radius);
    background: var(--lobe-surface);
    > strong { overflow-wrap: anywhere; }
    > span { color: var(--lobe-text-muted); }
  }
  .lobe-queue-task-status { color: var(--lobe-text-muted); }
  .lobe-results-lightbox > header > button {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    color: var(--lobe-text);
    background: var(--lobe-surface);
    border: 1px solid var(--lobe-border);
    border-radius: var(--lobe-radius-sm);
    &:hover, &:focus-visible { color: var(--lobe-accent-text); }
  }
  .lobe-queue-thumb {
    flex: 0 0 38px;
    width: 38px;
    height: 38px;
    min-width: 0 !important;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--lobe-border);
    border-radius: var(--lobe-radius-sm);
    &:hover, &:focus-visible { border-color: var(--lobe-accent-text); }
    > img { width: 100%; height: 100%; object-fit: cover; }
  }
  .lobe-results-lightbox[open] {
    position: fixed;
    inset: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    width: 100%;
    height: 100dvh;
    max-width: none;
    max-height: none;
    box-sizing: border-box;
    border: none;
    padding: 12px;
    margin: 0;
    gap: 12px;
    color: var(--lobe-text);
    background: var(--lobe-color-bg-layout);
    > header { display: flex; align-items: center; gap: 10px; justify-content: flex-end; }
    > img { width: 100%; height: 100%; min-height: 0; object-fit: contain; }
  }

  dialog.lobe-live-viewer {
    position: fixed;
    inset: 0;
    width: 100%;
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right))
      max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
    box-sizing: border-box;
    border: 0;
    color: var(--lobe-text);
    background: var(--lobe-color-bg-layout);
    &[open] {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      gap: 10px;
      animation: ${arrive} 170ms ease-out both;
    }
    > header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font: 600 var(--lobe-type-ui)/1.4 var(--lobe-font-family);
    }
    &[data-generating] .lobe-live-status { color: var(--lobe-accent-text); }
    > img { width: 100%; height: 100%; min-height: 0; object-fit: contain; }
  }

  @media (prefers-reduced-motion: reduce) {
    .progressDiv > .progress, .progress-bar-wrap > * { transition: none; }
    dialog.lobe-live-viewer[open] { animation: none; }
  }
  html[data-lobe-lite-effects='true'] {
    .progressDiv > .progress, .progress-bar-wrap > * { transition: none; }
    dialog.lobe-live-viewer[open] { animation: none; }
  }
`;
