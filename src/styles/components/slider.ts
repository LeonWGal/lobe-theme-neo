import { Theme, css } from 'antd-style';

export default (token: Theme) => css`
  input[type='range'] {
    cursor: pointer;
    accent-color: ${token.colorPrimary};

    height: 4px;
    margin-top: 8px;

    appearance: none;
    background: ${token.colorFillSecondary};
    border-radius: ${token.borderRadiusXS}px;
    outline: none;

    transition: var(--button-transition);

    &::-webkit-slider-thumb {
      width: 12px;
      height: 16px;

      appearance: none;
      background: ${token.colorPrimary};
      border: 1px solid ${token.colorPrimary};
      border-radius: ${token.borderRadiusSM}px;

      transition: var(--button-transition);

      &:hover,
      &:active {
        background: ${token.colorPrimaryHover};
        border-color: ${token.colorPrimaryHover};
        transform: scale(1.1);
      }
    }

    &::-moz-range-thumb {
      width: 12px;
      height: 16px;

      background: ${token.colorPrimary};
      border: 1px solid ${token.colorPrimary};
      border-radius: ${token.borderRadiusSM}px;

      transition: var(--button-transition);

      &:hover,
      &:active {
        background: ${token.colorPrimaryHover};
        border-color: ${token.colorPrimaryHover};
        transform: scale(1.1);
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
