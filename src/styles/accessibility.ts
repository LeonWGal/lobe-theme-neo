import { type Theme, css } from 'antd-style';

export default (token: Theme) => css`
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  [role='button']:focus-visible,
  [tabindex]:focus-visible {
    outline: 2px solid ${token.colorText} !important;
    outline-offset: 3px !important;
  }

  html[data-lobe-lite-effects='true'] aside.lobe-sidebar-float {
    transition: none !important;
  }

  html[data-lobe-lite-effects='true'] .lobe-app-header,
  html[data-lobe-lite-effects='true'] .lobe-sidebar-panel,
  html[data-lobe-lite-effects='true'] .ant-modal-content,
  html[data-lobe-lite-effects='true'] .ant-popover-inner {
    backdrop-filter: none !important;
  }
  @media (prefers-reduced-motion: reduce) {
    aside.lobe-sidebar-float {
      transition: none !important;
    }
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
