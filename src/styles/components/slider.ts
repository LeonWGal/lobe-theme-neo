import { Theme, css } from 'antd-style';

export default (token: Theme) => css`
  .gradio-slider,
  .block.gradio-slider {
    --slider-color: ${token.colorPrimary} !important;
  }

  .gradio-slider input[type='range'],
  input[type='range'] {
    cursor: pointer;
    accent-color: ${token.colorPrimary} !important;

    height: 4px;
    margin-top: 8px;

    appearance: none;
    background: ${token.colorFillSecondary};
    border-radius: ${token.borderRadiusXS}px;
    outline: none;

    transition: var(--button-transition);

    &::-webkit-slider-thumb {
      width: 14px !important;
      height: 18px !important;

      appearance: none !important;
      -webkit-appearance: none !important;
      background: ${token.colorPrimary} !important;
      background-color: ${token.colorPrimary} !important;
      border: 1px solid ${token.colorPrimary} !important;
      border-radius: ${token.borderRadiusSM}px !important;
      box-shadow: 0 0 0 1px ${token.colorBgContainer} !important;

      transition: var(--button-transition);

      &:hover,
      &:active {
        background: ${token.colorPrimaryHover} !important;
        background-color: ${token.colorPrimaryHover} !important;
        border-color: ${token.colorPrimaryHover} !important;
        transform: scale(1.15);
      }
    }

    &::-moz-range-thumb {
      width: 14px !important;
      height: 18px !important;

      background: ${token.colorPrimary} !important;
      background-color: ${token.colorPrimary} !important;
      border: 1px solid ${token.colorPrimary} !important;
      border-radius: ${token.borderRadiusSM}px !important;
      box-shadow: 0 0 0 1px ${token.colorBgContainer} !important;

      transition: var(--button-transition);

      &:hover,
      &:active {
        background: ${token.colorPrimaryHover} !important;
        background-color: ${token.colorPrimaryHover} !important;
        border-color: ${token.colorPrimaryHover} !important;
        transform: scale(1.15);
      }
    }

    &:hover {
      background: ${token.colorFill};
    }
  }

  .gradio-slider {
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
`;
