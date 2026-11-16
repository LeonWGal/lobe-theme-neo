import { Theme, css } from 'antd-style';

export default (token: Theme) => css`
  html[data-lobe-forge='true'] {
    overflow-x: clip;
    body {
      overflow-x: clip;
    }

    /* Layout skins must never override Gradio's visibility state. */
    #lobe-neo-theme-app :is(.block, .gradio-group, .gradio-row, .gradio-column, .form, .wrap).hide {
      display: none !important;
    }

    #extra_options_txt2img:has(> .styler:empty),
    #extra_options_img2img:has(> .styler:empty),
    #txt2img_settings > .gradio-group:has(> .styler > #extra_options_txt2img > .styler:empty),
    #img2img_settings > .gradio-group:has(> .styler > #extra_options_img2img > .styler:empty) {
      display: none !important;
    }

    #lobe-neo-theme-app :is(#txt2img_seed_row, #img2img_seed_row) {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) 36px 36px auto;
      gap: 8px !important;
      align-items: end !important;
      margin: 0 !important;
      padding: var(--lobe-control-padding, 16px) !important;
      background: var(--lobe-surface) !important;
      border: 1px solid var(--lobe-border) !important;
      border-radius: var(--lobe-radius) !important;
      > .form {
        min-width: 0 !important;
        width: auto !important;
      }
      > .form:last-child {
        min-width: max-content !important;
      }
      input:not([type='checkbox']) {
        height: 36px !important;
        font-family: ${token.fontFamily} !important;
        font-size: 14px !important;
        font-weight: 400 !important;
        font-variant-numeric: tabular-nums;
        background: var(--lobe-field) !important;
      }
    }
    #lobe-neo-theme-app
      & :is(#txt2img_random_seed, #img2img_random_seed, #txt2img_reuse_seed, #img2img_reuse_seed) {
      width: 36px !important;
      min-width: 36px !important;
      max-width: 36px !important;
      height: 36px !important;
      color: var(--lobe-text) !important;
      background: var(--lobe-field) !important;
      transform: none !important;
      &:hover {
        border-color: ${token.colorBorder} !important;
      }
    }
    #lobe-neo-theme-app :is(#txt2img_subseed_show, #img2img_subseed_show) {
      min-width: max-content;
      height: 36px !important;
      color: var(--lobe-text) !important;
      background: var(--lobe-field) !important;
      > label {
        display: flex !important;
        align-items: center;
        gap: 8px;
      }
    }
    #lobe-neo-theme-app :is(#txt2img_seed_extras, #img2img_seed_extras) {
      background: var(--lobe-surface) !important;
      border: 1px solid var(--lobe-border) !important;
      border-radius: var(--lobe-radius) !important;
      padding: var(--lobe-control-padding, 16px) !important;
      margin: 0 !important;
      input:not([type='range']) {
        font-family: ${token.fontFamily} !important;
        font-weight: 400 !important;
        background: var(--lobe-field) !important;
      }
    }

    .tab-nav button.selected,
    .lobe-header-tab[aria-selected='true'],
    .ant-segmented-item-selected .ant-segmented-item-label,
    .sd-ar-view-btn.active,
    .sd-ar-view-btn[aria-checked='true'],
    .sd-ar-ratio-badge {
      color: var(--lobe-accent-text) !important;
    }
    :is(#txt2img_settings, #img2img_settings) > .gradio-group,
    :is(#txt2img_settings, #img2img_settings) > .accordions {
      min-width: 0;
    }
    @media (max-width: 480px) {
      #lobe-neo-theme-app :is(#txt2img_seed_row, #img2img_seed_row) {
        grid-template-columns: 44px 44px minmax(0, 1fr);
        > .form:first-child {
          grid-column: 1 / -1;
        }
        > .form:last-child {
          justify-self: end;
        }
      }
      #lobe-neo-theme-app :is(#txt2img_seed_resize_from_row, #img2img_seed_resize_from_row) > .form {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 12px !important;
      }
    }
    @media (max-width: 900px) {
      #lobe-neo-theme-app
        & :is(
          #txt2img_random_seed,
          #img2img_random_seed,
          #txt2img_reuse_seed,
          #img2img_reuse_seed,
          #txt2img_random_subseed,
          #img2img_random_subseed,
          #txt2img_reuse_subseed,
          #img2img_reuse_subseed
        ) {
        width: 44px !important;
        min-width: 44px !important;
        max-width: 44px !important;
        height: 44px !important;
        min-height: 44px !important;
        max-height: 44px !important;
      }
      @media (min-width: 481px) {
        #lobe-neo-theme-app :is(#txt2img_seed_row, #img2img_seed_row) {
          grid-template-columns: minmax(0, 1fr) 44px 44px auto;
        }
      }
      #lobe-neo-theme-app :is(#txt2img_subseed_show, #img2img_subseed_show) {
        height: 44px !important;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .gradio-accordion > .label-wrap > .icon {
        transition: none !important;
      }
    }
    @media (min-width: 901px) {
      &[data-lobe-density='compact'] {
        #lobe-neo-theme-app :is(#txt2img_settings, #img2img_settings) { gap: 8px !important; }
        #lobe-neo-theme-app :is(#txt2img_settings, #img2img_settings) > .gradio-group { padding: 12px !important; }
        #lobe-neo-theme-app :is(.gradio-accordion, .input-accordion, details.accordion) { padding: 8px 12px !important; }
        #lobe-neo-theme-app .sd-ar-panel-compact { padding: 10px !important; }
      }
    }
  }
`;
