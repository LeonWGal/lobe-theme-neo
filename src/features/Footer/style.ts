import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  credit: css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    color: var(--lobe-text-muted);
    font-size: var(--lobe-type-meta);
    a { display: inline-flex; align-items: center; }
  `,
  footer: css`
    #lobe-neo-theme-app & {
      display: block !important;
      padding: 14px clamp(12px, 3vw, 36px);
      border-top: 1px solid var(--lobe-border);
      color: var(--lobe-text);
      background: var(--lobe-surface);
      font: 400 var(--lobe-type-ui)/1.5 ${token.fontFamily};
    }
    a, a:visited {
      color: var(--lobe-text-muted) !important;
      text-decoration: none;
    }
    a:hover {
      color: var(--lobe-text) !important;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  `,
  identity: css`
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 10px;
    strong { font-size: var(--lobe-type-ui); font-weight: 600; }
  `,
  inner: css`
    display: grid;
    gap: 10px;
    max-width: 1440px;
    margin-inline: auto;
  `,
  links: css`
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
  `,
  runtime: css`
    &:empty { display: none; }
    padding-top: 8px;
    border-top: 1px solid var(--lobe-border);
    #footer {
      margin: 0 !important;
      padding: 0 !important;
      color: var(--lobe-text-muted);
      text-align: start;
      background: transparent;
    }
    #footer :is(.prose, .html-container) {
      max-width: none;
      color: inherit;
    }
    #footer br { display: none; }
    #footer div.versions {
      display: block;
      margin-top: 4px;
      color: var(--lobe-text-muted);
      font-size: var(--lobe-type-meta);
      font-variant-numeric: tabular-nums;
      opacity: 1;
      overflow-wrap: anywhere;
    }
  `,
  top: css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 6px 20px;
  `,
  version: css`
    padding-inline: 6px;
    border: 1px solid var(--lobe-border);
    border-radius: ${token.borderRadiusSM}px;
    background: var(--lobe-field);
    color: var(--lobe-text-muted);
    font-size: var(--lobe-type-meta);
    font-variant-numeric: tabular-nums;
  `,
}));
