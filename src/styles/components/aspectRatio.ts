import { Theme, css } from 'antd-style';

export default (token: Theme) => css`
  /* —— Aspect Ratio & Generation Controls for Lobe Theme Neo —— */
  .sd-ar-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    margin: 4px 0;
    padding: 10px 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
    box-sizing: border-box;
    transition: border-color 0.2s ease;

    &:hover {
      border-color: ${token.colorPrimaryHover};
    }
  }

  .sd-ar-res-preview {
    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    font-weight: 700;
    color: ${token.colorPrimary};
  }

  .sd-ar-popover {
    position: fixed;
    z-index: 10050;
    background: ${token.colorBgElevated};
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    box-shadow: ${token.boxShadowSecondary};
  }

  .sd-ar-popover-btn.active {
    background: ${token.colorPrimary} !important;
    border-color: ${token.colorPrimary} !important;
    color: #121214 !important;
    font-weight: 700 !important;
  }

  .sd-ar-btn.active {
    background: ${token.colorPrimary} !important;
    border-color: ${token.colorPrimary} !important;
    color: #121214 !important;
  }
`;
