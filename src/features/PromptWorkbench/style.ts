import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  accordionSlot: css`
    max-height: clamp(280px, 42vh, 440px);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: ${token.colorBorder} transparent;
    padding: 10px 12px;
    border-radius: ${token.borderRadiusLG}px;
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgLayout};

    & > .gradio-accordion:not([id$='_tipo_accordion']) > .label-wrap,
    & > .input-accordion:not([id$='_tipo_accordion']) > .label-wrap,
    & > details.accordion:not([id$='_tipo_accordion']) > summary,
    & > #sddp-dynamic-prompting > .gradio-accordion > .label-wrap,
    & > #sddp-dynamic-prompting > details.accordion > summary,
    & > .booru-gacha-container > .gradio-accordion > .label-wrap,
    & > .booru-gacha-container > details.accordion > summary {
      display: none !important;
    }

    & > [id$='_tipo_accordion'] > .label-wrap {
      padding: 6px 10px !important;
      margin-bottom: 8px !important;
      border-radius: ${token.borderRadius}px !important;
      border: 1px solid ${token.colorBorderSecondary} !important;
      background: ${token.colorFillQuaternary} !important;
    }

    & > .gradio-accordion,
    & > .input-accordion,
    & > details.accordion,
    & > [id$='_tipo_accordion'],
    & > #sddp-dynamic-prompting > .gradio-accordion,
    & > #sddp-dynamic-prompting > details.accordion,
    & > .booru-gacha-container,
    & > .booru-gacha-container > .gradio-accordion,
    & > .booru-gacha-container > details.accordion,
    & > .booru-gacha-container .sd-ar-panel-compact {
      border: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    & .gradio-accordion,
    & .input-accordion,
    & #sddp-dynamic-prompting,
    & .booru-gacha-container {
      margin: 0 !important;
    }

    & #sddp-dynamic-prompting .gradio-accordion .gradio-accordion {
      border-radius: ${token.borderRadius}px;
      border: 1px solid ${token.colorBorderSecondary};
      background: ${token.colorBgContainer};
    }

    & #sddp-dynamic-prompting .sddp-warning {
      display: block;
      padding: 8px 12px;
      border-radius: ${token.borderRadius}px;
      border: 1px solid ${token.colorWarningBorder};
      background: ${token.colorWarningBg};
      color: ${token.colorWarningText};
      font-size: 12px;
    }

    & #sddp-dynamic-prompting code,
    & #sddp-dynamic-prompting pre {
      background: ${token.colorFillTertiary};
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusSM}px;
      padding: 2px 6px;
      font-size: 12px;
    }
  `,
  bottomWrap: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 6px;
    border-top: 1px solid ${token.colorBorderSecondary};
  `,
  panelCard: css`
    padding: 8px 10px;
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgLayout};
    max-height: clamp(260px, 38vh, 400px);
    overflow-y: auto;

    & [id$='_styles_row'] {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      margin: 0 !important;
      padding: 0 !important;
      > :first-child { flex: 1 1 auto; min-width: 0; }
    }
  `,
  panelWrap: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    min-width: 0;
  `,
  pill: css`
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    height: 30px !important;
    min-height: 30px !important;
    padding: 0 10px !important;
    border-radius: var(--lobe-radius-sm, ${token.borderRadiusSM}px) !important;
    font-size: 12.5px !important;
    font-weight: 500 !important;
    line-height: 1 !important;
    white-space: nowrap !important;
    cursor: pointer !important;
    border: 1px solid var(--lobe-border, ${token.colorBorderSecondary}) !important;
    background: var(--lobe-field, ${token.colorFillTertiary}) !important;
    color: var(--lobe-text-muted, ${token.colorTextSecondary}) !important;
    box-shadow: none !important;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease;

    &:hover {
      background: ${token.colorFillSecondary} !important;
      border-color: ${token.colorBorder} !important;
      color: var(--lobe-text, ${token.colorText}) !important;
    }
  `,
  pillActive: css`
    border-color: ${token.colorPrimaryBorder} !important;
    background: ${token.colorPrimaryBg} !important;
    color: var(--lobe-accent-text, ${token.colorPrimaryText}) !important;
    font-weight: 600 !important;
    box-shadow: none !important;

    &:hover {
      border-color: ${token.colorPrimaryBorderHover} !important;
      background: ${token.colorPrimaryBgHover} !important;
      color: var(--lobe-accent-text, ${token.colorPrimaryTextHover}) !important;
    }
  `,
  pillBar: css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  `,
  pillChevron: css`
    flex: none;
    opacity: 0.65;
    margin-left: -2px;
  `,
  pillEnabled: css`
    border-color: ${token.colorSuccessBorder} !important;
    background: ${token.colorSuccessBg} !important;
    color: var(--lobe-text, ${token.colorText}) !important;

    &:hover {
      border-color: ${token.colorSuccessBorderHover} !important;
      background: ${token.colorSuccessBgHover} !important;
    }
  `,
  pillIcon: css`
    flex: none;
    opacity: 0.85;
  `,
  statusDot: css`
    width: 7px;
    height: 7px;
    border-radius: 9999px;
    background: ${token.colorSuccess};
    flex: none;
  `,
  tagsEditor: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 4px 0;
  `,
  tagsGroup: css`
    display: flex;
    flex-direction: column;
    gap: 3px;
  `,
  tagsLabel: css`
    font-size: 12px;
    font-weight: 600;
    color: ${token.colorTextSecondary};
  `,
  toggleDot: css`
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    border: 1.5px solid ${token.colorTextQuaternary};
    background: transparent;
    flex: none;
    transition: all 0.15s ease;
  `,
  toggleDotOn: css`
    border-color: ${token.colorSuccess};
    background: ${token.colorSuccess};
  `,
  toolsHost: css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    min-width: 0;

    & > [id$='_tools'] {
      margin: 0 !important;
      padding: 0 !important;
      width: auto !important;
      gap: 4px !important;
    }
  `,
  topBar: css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding-bottom: 4px;
    border-bottom: 1px solid ${token.colorBorderSecondary};
  `,
}));
