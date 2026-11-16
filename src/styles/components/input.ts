import { Theme, css } from 'antd-style';

export default (token: Theme) => {
  return css`
    .block.gradio-checkbox {
      margin: 0 !important;
    }

    .block.gradio-slider {
      input[type='number'] {
        margin-left: 12px;
      }
    }

    label:has(input[type='radio']),
    label:has(input[type='checkbox']) {
      border-radius: ${token.borderRadius}px !important;
    }

    /* Gradio 4 file / checkbox polish */
    .block.gradio-file,
    .block.gradio-uploadbutton {
      border-radius: ${token.borderRadius}px !important;
    }

    .wrap.default.full {
      border-radius: ${token.borderRadius}px;
    }

    input {
      &:not(
        [type='range'],
        [type='checkbox'],
        [type='number'],
        [type='radio'],
        [type='file'],
        .border-none,
        .ant-input,
        .ant-select-input,
        .ant-select-selection-search-input
      ) {
        resize: none;

        overflow: hidden;

        width: 100%;
        height: var(--button-lg-tool-height) !important;
        border-radius: ${token.borderRadius}px;

        text-overflow: ellipsis;
        white-space: nowrap;

        background: ${token.colorFillTertiary} !important;
        border: 1px solid ${token.colorBorderSecondary} !important;
        color: ${token.colorText};

        &:focus {
          border-color: ${token.colorPrimary} !important;
          background: ${token.colorFillSecondary} !important;
        }
      }

      &[type='number']:not(.ant-input-number-input) {
        height: var(--button-lg-tool-height) !important;
        border-radius: ${token.borderRadius}px;
        background: ${token.colorFillTertiary} !important;
        border: 1px solid ${token.colorBorderSecondary} !important;
        color: ${token.colorText};

        &:focus {
          border-color: ${token.colorPrimary} !important;
          background: ${token.colorFillSecondary} !important;
        }
      }

      &[type='checkbox'],
      &[type='radio'] {
        cursor: pointer;

        flex: 0;

        width: ${token.fontSize}px;
        min-width: ${token.fontSize}px;
        max-width: ${token.fontSize}px;
        height: ${token.fontSize}px;
        min-height: ${token.fontSize}px;
        max-height: ${token.fontSize}px;

        appearance: none !important;
      }

      &[type='checkbox'] {
        --ring-color: transparent;

        position: relative;

        border: 1px solid ${token.colorBorder} !important;
        border-radius: ${token.borderRadiusSM}px !important;

        line-height: var(--line-sm);

        background-color: ${token.colorFillTertiary} !important;

        &:checked {
          border-color: ${token.colorPrimaryBorder} !important;
          background-color: ${token.colorPrimary} !important;
          background-image: var(--checkbox-check) !important;
        }
      }

      &[type='radio'] {
        --ring-color: transparent;

        position: relative;

        border: 1px solid ${token.colorBorder} !important;
        border-radius: 50% !important;

        line-height: var(--line-sm);

        background-color: ${token.colorFillTertiary} !important;
        background-position: center !important;
        background-repeat: no-repeat !important;

        &:checked {
          border-color: ${token.colorPrimaryBorder} !important;
          background-color: ${token.colorPrimary} !important;
          background-image: var(--radio-circle) !important;
        }
      }
    }

    textarea:not(.border-none) {
      border: 1px solid ${token.colorBorderSecondary} !important;
      border-radius: ${token.borderRadius}px !important;
      background: ${token.colorFillTertiary} !important;
      color: ${token.colorText};

      &:focus {
        border-color: ${token.colorPrimary} !important;
        background: ${token.colorFillSecondary} !important;
      }
    }
  `;
};
