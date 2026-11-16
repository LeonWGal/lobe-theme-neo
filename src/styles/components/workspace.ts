import { Theme, css } from 'antd-style';

export default (token: Theme) => css`
  html.dark[data-lobe-forge='true'] #lobe-neo-theme-app
    :is([id$='_prompt_container'], #hires_prompt, #hires_neg_prompt) textarea::-webkit-resizer {
    background: repeating-linear-gradient(
      135deg,
      transparent 0 3px,
      var(--lobe-text-muted) 3px 4px
    ) right bottom / 8px 8px no-repeat;
  }

  html[data-lobe-forge='true'] #lobe-neo-theme-app {
    /* Match the ID-based Forge overrides for controls such as the Seed row. */
    &#lobe-neo-theme-app [data-lobe-workspace-hidden='true']:not([id$='_gallery_container']:has(> .lobe-split-action-header)) {
      display: none !important;
    }
    [id$='_gallery_container'][data-lobe-workspace-hidden='true']:has(> .lobe-split-action-header) {
      min-height: 0 !important;
      > :not(.lobe-split-action-header) { display: none !important; }
    }
    [data-lobe-workspace-order] { order: var(--lobe-workspace-order) !important; }
    [data-lobe-prompt-height] textarea,
    [data-lobe-prompt-height] .prompt_editor {
      min-height: var(--lobe-prompt-height) !important;
      max-height: none !important;
    }
    .gradio-row[data-lobe-prompt-fields]:not(:has([data-lobe-prompt-field]:not([data-lobe-workspace-hidden]))) {
      display: none !important;
    }
    [data-lobe-prompt-host]:not(:has(> :not(.hidden, .hide, [hidden]))) { display: none !important; }
    & :is(#tab_txt2img, #tab_img2img, #txt2img_settings, #img2img_settings) {
      container: lobe-generation / inline-size;
    }
    & :is(#txt2img_toprow, #img2img_toprow) {
      order: -1000;
      flex: 0 0 auto !important;
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) minmax(180px, 240px);
      align-items: start !important;
      align-content: start !important;
      gap: var(--lobe-prompt-gap) !important;
      padding: var(--lobe-prompt-inset) !important;
      border: 1px solid var(--lobe-border);
      border-radius: var(--lobe-radius);
      background: var(--lobe-surface);
      min-height: 0 !important;
    }
    & [data-lobe-workbench-layout='stage'] :is(#txt2img_toprow, #img2img_toprow) {
      width: 100%;
      max-width: 100%;
    }
    & [data-lobe-workbench-layout='stage'] :is(#txt2img_toprow, #img2img_toprow) > .lobe-workbench-stage {
      grid-column: 1 / -1;
      width: 100%;
      min-width: 0;
    }
    & [data-lobe-workbench-layout='docked'] :is(#txt2img_toprow, #img2img_toprow) {
      grid-template-columns: minmax(0, 1fr);
    }
    & [data-lobe-workbench-layout='docked'] :is(#txt2img_actions_column, #img2img_actions_column) {
      order: -1;
      display: flex !important;
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 6px !important;
      > :is([id$='_generate_box'], [id$='_enqueue_wrapper']) {
        width: 100% !important;
      }
      [id$='_generate_box'] > button[id$='_generate'] {
        width: 100% !important;
      }
    }
    & :is(#txt2img_prompt_container, #img2img_prompt_container) {
      width: 100% !important;
      min-width: 0 !important;
    }
    & :is(#txt2img_prompt_container, #img2img_prompt_container) > :is([id$='_prompt_row'], [id$='_neg_prompt_row']) {
      width: 100% !important;
      min-width: 0 !important;
      > * {
        width: 100% !important;
        min-width: 0 !important;
      }
    }
    & :is(#txt2img_toprow, #img2img_toprow) > :is([id$='_prompt_container'], [id$='_actions_column']) {
      align-self: start !important;
      justify-content: flex-start !important;
      min-height: 0 !important;
      min-width: 0 !important;
      width: 100% !important;
    }
    @container lobe-generation (max-width: 640px) {
      & :is(#txt2img_toprow, #img2img_toprow) {
        grid-template-columns: minmax(0, 1fr);
        > :is(#txt2img_actions_column, #img2img_actions_column) { order: -1; }
      }
    }
    & :is(#txt2img_toprow, #img2img_toprow) > :only-child { grid-column: 1 / -1; }
    & :is(#txt2img_prompt, #txt2img_neg_prompt, #img2img_prompt, #img2img_neg_prompt) textarea {
      font-family: var(--lobe-font-family-code) !important;
      font-size: var(--lobe-prompt-font-size) !important;
      line-height: 1.5 !important;
    }
    & :is(#tab_txt2img, #tab_img2img) :is(
      [id$='_steps'], [id$='_cfg_scale'], [id$='_width'], [id$='_height']
    ) input[type='number'] {
      font-family: var(--lobe-font-family) !important;
      font-variant-numeric: tabular-nums;
    }
    & :is(#txt2img_actions_column, #img2img_actions_column) {
      gap: 6px !important;
      > :is([id$='_generate_box'], [id$='_enqueue_wrapper'], [id$='_tools'], [id$='_styles_row']) {
        flex: 0 0 auto !important;
        margin-block: 0 !important;
      }
    }
    #mode_img2img { order: -999; }
    [data-lobe-workspace-flat='contents'] { display: contents !important; }
    [data-lobe-workspace-flat='true'] {
      padding: 0 !important;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }
    & :is(#txt2img_settings, #img2img_settings) > .gradio-group:has(> .styler:only-child:empty),
    & :is(#txt2img_script_container, #img2img_script_container) > .styler
      > .gradio-group:has(> .styler:only-child):not(:has(> .styler > :not(.hidden, .hide, [hidden]))) {
      display: none !important;
    }
    & :is(#txt2img_script_container, #img2img_script_container) > .styler {
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
      > [data-lobe-extension-panel] { margin: 0 !important; }
    }
    [data-lobe-extension-panel] :is(.gradio-accordion, .input-accordion, .gradio-group):not(:is(.gradio-accordion, .input-accordion) *) {
      margin: 0 !important;
    }
    [data-lobe-workspace-flat='true'] :is(.gradio-row, .gradio-column, .gradio-group, .styler):has(> :is(.gradio-accordion, .input-accordion, details.accordion):only-child) {
      padding: 0 !important;
      margin: 0 !important;
      border: 0 !important;
    }
    & :is(#txt2img_accordions, #img2img_accordions, #txt2img_settings, #img2img_settings) {
      gap: 8px !important;
      reading-flow: flex-visual;
    }
    & :is(#txt2img_settings, #img2img_settings) :is(.gradio-accordion, .input-accordion)
      > .label-wrap > span:not(.icon),
    & :is(#txt2img_settings, #img2img_settings) :is(.gradio-accordion, .input-accordion)
      > .label-wrap > span:not(.icon) > b {
      font-family: ${token.fontFamily} !important;
    }
    & :is(#txt2img_prompt_container, #img2img_prompt_container, #txt2img_actions_column, #img2img_actions_column, .lobe-split-action-header) {
      reading-flow: flex-visual;
    }
    & :is(#txt2img_tools, #img2img_tools, #image_buttons_txt2img, #image_buttons_img2img) {
      reading-flow: flex-visual;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px !important;
      width: 100%;
      min-width: 0;
      > button, .lobe-prompt-format-tools > button {
        flex: 0 0 36px !important;
        width: 36px !important;
        min-width: 36px !important;
        max-width: 36px !important;
        height: 36px !important;
        min-height: 36px !important;
        max-height: 36px !important;
        margin: 0 !important;
        border-radius: ${token.borderRadius}px !important;
      }
      > .lobe-prompt-format-tools {
        flex: 0 0 auto !important;
        gap: 4px !important;
        width: auto;
        min-width: 0;
      }
    }
    [data-lobe-workspace-columns] {
      display: grid !important;
      grid-template-columns: minmax(0, var(--lobe-workspace-parameters)) 16px minmax(0, var(--lobe-workspace-preview)) !important;
      align-items: start !important;
      gap: 0 !important;
      reading-flow: grid-rows;
      > .gradio-column { width: 100% !important; min-width: 0 !important; }
      > .resize-handle { display: none !important; }
      > [data-lobe-workspace-parameter-column] { grid-area: 1 / 1; min-width: 0 !important; }
      > :is(#txt2img_results, #img2img_results) { grid-area: 1 / 3; }
      > .lobe-workspace-divider {
        position: relative;
        grid-column: 2;
        grid-row: 1;
        align-self: stretch;
        cursor: col-resize;
        touch-action: none;
        user-select: none;
        &::after {
          content: '';
          position: absolute;
          inset: 0 calc(50% - 1px);
          border-radius: 2px;
          background: var(--lobe-border);
          opacity: .65;
        }
        &:is(:hover, :focus-visible, [data-dragging])::after {
          background: var(--lobe-accent-text);
          opacity: 1;
        }
      }
    }
    [data-lobe-workspace-columns]:not([data-lobe-workspace-columns='stacked']):not([data-lobe-workspace-columns='studio'])
      :is(#txt2img_results, #img2img_results) {
      [id$='_gallery_container'] {
        min-height: clamp(520px, calc(100dvh - 210px), 920px);
      }

      [id$='_gallery'] {
        height: clamp(460px, calc(100dvh - 260px), 860px) !important;
      }
    }
    [data-lobe-studio-collapsed='true'] [data-lobe-workspace-columns='studio']
      :is(#txt2img_results, #img2img_results) [id$='_gallery'] {
      height: clamp(380px, 54dvh, 700px) !important;
    }
    [data-lobe-studio-collapsed='false'] [data-lobe-workspace-columns='studio']
      :is(#txt2img_results, #img2img_results) [id$='_gallery'] {
      height: clamp(320px, 44dvh, 560px) !important;
    }
    [data-lobe-workspace-columns='previewLeft'] {
      grid-template-columns: minmax(0, var(--lobe-workspace-preview)) 16px minmax(0, var(--lobe-workspace-parameters)) !important;
      > [data-lobe-workspace-parameter-column] { grid-column: 3; }
      > :is(#txt2img_results, #img2img_results) { grid-column: 1; order: -1; }
    }
    [data-lobe-workspace-columns='threeCol'] {
      grid-template-columns: minmax(260px, 24%) minmax(320px, 1fr) minmax(300px, 36%) !important;
      gap: 12px !important;
      > [data-lobe-workspace-parameter-column] { grid-area: 1 / 1; }
      > :is(#txt2img_toprow, #img2img_toprow) { grid-area: 1 / 2; margin-inline: 0 !important; max-width: 100% !important; }
      > :is(#txt2img_results, #img2img_results) { grid-area: 1 / 3; }
    }
    [data-lobe-workspace-columns='threeColPreviewLeft'] {
      grid-template-columns: minmax(300px, 36%) minmax(320px, 1fr) minmax(260px, 24%) !important;
      gap: 12px !important;
      > :is(#txt2img_results, #img2img_results) { grid-area: 1 / 1; }
      > :is(#txt2img_toprow, #img2img_toprow) { grid-area: 1 / 2; margin-inline: 0 !important; max-width: 100% !important; }
      > [data-lobe-workspace-parameter-column] { grid-area: 1 / 3; }
    }
    @container lobe-generation (max-width: 1100px) {
      :is([data-lobe-workspace-columns='threeCol'], [data-lobe-workspace-columns='threeColPreviewLeft']) {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
        > [data-lobe-workspace-parameter-column] { grid-column: 1; grid-row: 2; }
        > :is(#txt2img_toprow, #img2img_toprow) { grid-column: 1; grid-row: 1; }
        > :is(#txt2img_results, #img2img_results) { grid-column: 2; grid-row: 1 / 3; }
      }
    }
    [data-lobe-workspace-columns='studio'] :is(#txt2img_results, #img2img_results) {
      & :is(
        #lobe_html_info_txt2img,
        #lobe_html_info_img2img,
        [id^='html_info'],
        [id^='generation_info'],
        [id^='html_log'],
        .html-log,
        [id$='_generation_info'],
        .gradio-accordion:has([id^='html_info'], [id^='generation_info']),
        .gradio-group:has([id^='html_info'], [id^='generation_info'])
      ) {
        display: none !important;
      }
    }
    [data-lobe-studio-collapsed='true'] [data-lobe-workspace-columns='studio'] {
      grid-template-columns: minmax(0, 1fr) !important;
      gap: 12px !important;
      > [data-lobe-workspace-parameter-column] { display: none !important; }
      > :is(#txt2img_toprow, #img2img_toprow) {
        grid-area: auto;
        order: -2 !important;
        width: 100%;
        max-width: 100%;
        margin-inline: 0;
      }
      > :is(#txt2img_results, #img2img_results) {
        grid-area: auto;
        order: -1 !important;
        position: relative !important;
        top: auto !important;
        width: 100%;
        max-width: 100%;
        margin-inline: 0;
      }
    }
    [data-lobe-studio-collapsed='false'] [data-lobe-workspace-columns='studio'] {
      grid-template-columns: minmax(280px, 24%) minmax(0, 1fr) !important;
      gap: 12px !important;
      > [data-lobe-workspace-parameter-column] { grid-column: 1; grid-row: 1 / 3; }
      > :is(#txt2img_toprow, #img2img_toprow) {
        grid-column: 2;
        grid-row: 1;
        width: 100%;
        max-width: 100%;
      }
      > :is(#txt2img_results, #img2img_results) {
        grid-column: 2;
        grid-row: 2;
        position: relative !important;
        top: auto !important;
        width: 100%;
        max-width: 100%;
      }
    }
    [data-lobe-workspace-columns='stacked'] {
      grid-template-columns: minmax(0, 1fr) !important;
      > :is(#txt2img_toprow, #img2img_toprow) { order: 0 !important; }
      > [data-lobe-workspace-parameter-column] { grid-area: auto; order: 1 !important; }
      > :is(#txt2img_results, #img2img_results) {
        grid-area: auto;
        order: -1 !important;
        position: relative !important;
        top: auto !important;
        width: 100%;
        max-width: 960px;
        margin-inline: auto;
      }
    }
    @container lobe-generation (max-width: 700px) {
      [data-lobe-workspace-columns] {
        gap: 12px !important;
        grid-template-columns: minmax(0, 1fr) !important;
        > .lobe-workspace-divider { display: none !important; }
        > [data-lobe-workspace-parameter-column] { grid-area: auto; }
        > :is(#txt2img_results, #img2img_results) { grid-area: auto; order: 0; position: relative !important; top: auto !important; }
      }
    }
  }
`;
