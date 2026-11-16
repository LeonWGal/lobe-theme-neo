import { css } from 'antd-style';

export default css`
  :root {
    --lobe-motion-press: 65ms;
    --lobe-motion-state: 130ms;
    --lobe-motion-release: 220ms;
    --lobe-motion-panel: 260ms;
    --lobe-motion-out: cubic-bezier(.2, .75, .25, 1);
    --lobe-motion-settle: cubic-bezier(.2, 1.35, .4, 1);
  }

  .generate-box > button[id$='_generate']:not(:disabled) {
    --lobe-press-scale: .985;
    --lobe-press-offset: 2px;
    box-shadow: 0 3px 14px color-mix(in srgb, var(--color-accent) 28%, transparent) !important;
    &:is(:hover, :focus-visible) {
      box-shadow: 0 5px 22px color-mix(in srgb, var(--color-accent) 45%, transparent) !important;
    }
    &:active {
      box-shadow: 0 1px 6px color-mix(in srgb, var(--color-accent) 22%, transparent) !important;
    }
  }

  html.light .generate-box > button[id$='_generate']:not(:disabled) {
    /* Pale accents need a denser edge to remain visible on bright panels. */
    --lobe-glow-ink: color-mix(in srgb, var(--color-accent) 58%, var(--lobe-accent-text));
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--lobe-glow-ink) 38%, transparent),
      0 4px 15px color-mix(in srgb, var(--lobe-glow-ink) 55%, transparent) !important;
    &:is(:hover, :focus-visible) {
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--lobe-glow-ink) 55%, transparent),
        0 6px 22px color-mix(in srgb, var(--lobe-glow-ink) 68%, transparent) !important;
    }
    &:active {
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--lobe-glow-ink) 34%, transparent),
        0 2px 8px color-mix(in srgb, var(--lobe-glow-ink) 40%, transparent) !important;
    }
  }

  :is(#txt2img_toprow, #img2img_toprow):has(button[id$='_generate']:is(:hover, :focus-visible):not(:disabled))
    [id$='_prompt_container'] textarea {
    border-color: color-mix(in srgb, var(--color-accent) 38%, var(--lobe-border)) !important;
  }

  @keyframes lobe-panel-appear {
    from { opacity: 0; translate: 0 -6px; scale: .975; }
    to { opacity: 1; translate: none; scale: none; }
  }
  @keyframes lobe-tab-indicator {
    from { opacity: .35; scale: .5 1; }
    to { opacity: 1; scale: 1; }
  }
  @keyframes lobe-accordion-reveal {
    from { opacity: .55; translate: 0 -3px; }
    to { opacity: 1; translate: none; }
  }

  @media (prefers-reduced-motion: no-preference) {
    html[data-lobe-lite-effects='false'] {
      :is(
        .lobe-app-header button,
        .lobe-sidebar-heading button,
        .lobe-sidebar-toggle > button,
        .lobe-quick-body button,
        .lobe-extra-network-body button,
        .lobe-extra-network-body .card[onclick],
        .lobe-extra-network-body .extra-network-control > [role='button'],
        .lobe-settings-body :is(button, .ant-select-selector),
        #lobe-neo-theme-app button.gradio-button
      ):not(:disabled, [aria-disabled='true'], .ant-btn-loading) {
        transition:
          scale var(--lobe-motion-release) var(--lobe-motion-settle),
          translate var(--lobe-motion-release) var(--lobe-motion-out),
          background-color var(--lobe-motion-state) ease-out,
          border-color var(--lobe-motion-state) ease-out,
          color var(--lobe-motion-state) ease-out,
          box-shadow var(--lobe-motion-state) ease-out;
        &:active {
          scale: var(--lobe-press-scale, .97);
          translate: 0 var(--lobe-press-offset, 1px);
          transition-duration: var(--lobe-motion-press);
          transition-timing-function: ease-out;
        }
      }

      @media (hover: hover) and (pointer: fine) {
        :is(.generate-box > button[id$='_generate'], .lobe-motion-control,
            .lobe-extra-network-body .card[onclick]):hover:not(:active, :disabled, [aria-disabled='true']) {
          translate: 0 -2px;
        }
      }

      .lobe-tab-launcher-panel {
        transform-origin: top right;
        animation: lobe-panel-appear var(--lobe-motion-panel) var(--lobe-motion-out) both;
      }
      .lobe-header-tab[aria-current='page']::after,
      .lobe-extra-network-body .tab-nav > button:is(.selected, [aria-selected='true'])::after {
        animation: lobe-tab-indicator var(--lobe-motion-release) var(--lobe-motion-settle) both;
      }
      #lobe-neo-theme-app :is(.gradio-accordion, .input-accordion) > .label-wrap.open + *,
      #lobe-neo-theme-app details.accordion[open] > summary + * {
        animation: lobe-accordion-reveal 180ms var(--lobe-motion-out) both;
      }
      .lobe-settings-body .ant-switch:active:not(:disabled) {
        .ant-switch-handle { scale: 1.12 .94; }
      }
      .lobe-settings-body .ant-switch-handle {
        transition:
          inset-inline-start var(--lobe-motion-release) var(--lobe-motion-out),
          scale var(--lobe-motion-state) var(--lobe-motion-out);
      }
    }
  }
`;
