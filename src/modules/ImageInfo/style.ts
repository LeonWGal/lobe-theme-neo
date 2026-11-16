import { colors as colorScales } from '@lobehub/ui/color';
import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token, isDarkMode }) => {
  const type = isDarkMode ? 'dark' : 'light';
  const color = isDarkMode ? colorScales.lime[type][9] : colorScales.green[type][10];

  return {
    configHeader: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
      padding: 6px 10px;
      cursor: pointer;
      user-select: none;
      font-family: ${token.fontFamilyCode};
      font-size: 12px;
      color: ${token.colorTextSecondary};
      background: ${token.colorFillTertiary};
      border: 0;
      border-radius: ${token.borderRadius}px;
      text-align: left;

      &:hover {
        color: ${token.colorText};
        background: ${token.colorFillSecondary};
      }
    `,
    configRow: css`
      padding: 1px 0;
      line-height: 1.35;
      border-bottom: 1px solid ${token.colorSplit};

      &:last-child {
        border-bottom: none;
      }
    `,
    configSummary: css`
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: ${token.colorText};
    `,
    configTitle: css`
      color: ${token.colorTextSecondary};
      flex-shrink: 0;
    `,
    configValue: css`
      color: ${token.colorInfoText};
      text-align: right;
      word-break: break-word;
    `,
    container: css`
      padding: 8px 10px 8px 12px;

      font-family: ${token.fontFamilyCode};
      font-size: 12px;

      background: ${token.colorFillTertiary};
      border-radius: ${token.borderRadius}px;
    `,
    highlight: css`
      pre {
        font-family: ${token.fontFamilyCode} !important;
        font-size: 13px !important;
        line-height: 1.5 !important;
        word-wrap: break-word !important;
        white-space: pre-wrap !important;
        vertical-align: bottom !important;
      }
    `,
    negative: css`
      span[style='color:${color.toUpperCase()}'] {
        color: ${token.colorErrorTextHover} !important;
      }
    `,
  };
});
