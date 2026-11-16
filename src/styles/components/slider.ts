import { Theme, css } from 'antd-style';

export default (token: Theme) => css`
  /* Shared native / aspect-ratio geometry, with a 28px pointer target. */
  html .gradio-slider input[type='range'],
  html input[type='range'].gradio-slider,
  html input.sd-ar-compact-slider {
    --slider-color: ${token.colorPrimary};
    appearance: none !important;
    cursor: pointer;
    box-sizing: border-box;
    width: 100% !important;
    height: 28px !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 2px !important;
    background: linear-gradient(
        to right,
        ${token.colorPrimary} var(--lobe-range-progress, 0%),
        ${token.colorFillSecondary} var(--lobe-range-progress, 0%)
      )
      center / calc(100% - 14px) 4px no-repeat !important;
    transition: none;
    &::-webkit-slider-runnable-track {
      appearance: none;
      height: 28px !important;
      border: 0 !important;
      background: transparent !important;
    }
    &::-webkit-slider-thumb {
      appearance: none !important;
      width: 14px !important;
      height: 14px !important;
      margin-top: 7px !important;
      border: 0 !important;
      border-radius: 50% !important;
      background: ${token.colorPrimary} !important;
      box-shadow: 0 0 0 1px ${token.colorBgContainer} !important;
      transition:
        transform 120ms ease,
        box-shadow 120ms ease !important;
    }
    &::-moz-range-thumb {
      width: 14px !important;
      height: 14px !important;
      border: 0 !important;
      border-radius: 50% !important;
      background: ${token.colorPrimary} !important;
      box-shadow: 0 0 0 1px ${token.colorBgContainer} !important;
      transition:
        transform 120ms ease,
        box-shadow 120ms ease !important;
    }
    &::-moz-range-track {
      background: transparent;
      border: 0;
    }
    &:hover::-webkit-slider-thumb,
    &:active::-webkit-slider-thumb {
      transform: scale(1.12);
      box-shadow: 0 0 0 4px ${token.colorPrimaryBg} !important;
    }
    &:hover::-moz-range-thumb,
    &:active::-moz-range-thumb {
      transform: scale(1.12);
      box-shadow: 0 0 0 4px ${token.colorPrimaryBg} !important;
    }
    &:disabled {
      cursor: default;
      opacity: 0.5;
    }
    &:focus-visible {
      outline: 2px solid ${token.colorPrimary};
      outline-offset: 2px;
    }
  }

  html .gradio-slider .head,
  html .sd-ar-slider-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 32px;
  }
  html .gradio-slider .head input[type='number'],
  html #quicksettings .gradio-slider input[type='number'],
  html #sampler_selection_txt2img.sd-ar-enhanced-sampler .gradio-slider .head input[type='number'],
  html #sampler_selection_img2img.sd-ar-enhanced-sampler .gradio-slider .head input[type='number'],
  html input.sd-ar-compact-num {
    flex: 0 0 62px;
    box-sizing: border-box;
    width: 62px !important;
    min-height: 32px !important;
    height: 32px !important;
    margin: 0 !important;
    padding: 4px 8px !important;
    border: 1px solid ${token.colorBorderSecondary} !important;
    border-radius: ${token.borderRadiusSM}px !important;
    color: ${token.colorText} !important;
    background: ${token.colorFillTertiary} !important;
    font-family: ${token.fontFamilyCode} !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    text-align: center;
    transition:
      border-color 120ms ease,
      background-color 120ms ease !important;
    &:focus {
      border-color: ${token.colorPrimary} !important;
      background: ${token.colorFillSecondary} !important;
    }
  }
  .ant-slider {
    .ant-slider-rail {
      height: 4px;
      background: ${token.colorFillSecondary};
    }
    .ant-slider-track {
      height: 4px;
      background: ${token.colorPrimary};
    }
    .ant-slider-handle::after {
      width: 14px;
      height: 14px;
      inset: -2px;
      border-radius: 50%;
      background: ${token.colorPrimary};
      box-shadow: 0 0 0 1px ${token.colorBgContainer};
    }
    .ant-slider-handle:hover::after,
    .ant-slider-handle:focus-visible::after {
      width: 14px;
      height: 14px;
      inset: -2px;
      box-shadow: 0 0 0 4px ${token.colorPrimaryBg};
    }
  }
`;
