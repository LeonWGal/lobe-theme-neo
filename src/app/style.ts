import { createStyles, keyframes } from 'antd-style';

const lightDrift = keyframes`
  50% { background-position: right 11vw top 76px; }
`;

export const useStyles = createStyles(
  (
    { css, token, isDarkMode },
    { headerHeight, isPrimaryColor }: { headerHeight: number; isPrimaryColor: boolean },
  ) => ({
    panel: css`
      .draggable-panel {
        border-style: dashed;
      }
    `,
    quicksettings: css`
      #quicksettings {
        align-items: start;
        padding: 16px !important;
      }
    `,
    sidebar: css`
      position: sticky;
      top: ${headerHeight}px;
      align-self: flex-start;
      height: calc(100dvh - ${headerHeight}px);
    `,
    workspace: css`
      background-image: radial-gradient(
        closest-side at 60% 45%,
        ${isPrimaryColor ? `color-mix(in srgb, ${token.colorPrimary} ${isDarkMode ? 20 : 12}%, transparent)` : 'transparent'},
        transparent 100%
      );
      background-position: right 2vw top ${headerHeight + 8}px;
      background-size: min(52vw, 760px) 260px;
      background-repeat: no-repeat;

      html[data-lobe-lite-effects='false'] & { animation: ${lightDrift} 14s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) { animation: none !important; }
    `,
  }),
);
