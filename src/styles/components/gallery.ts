import { Theme, css } from 'antd-style';

export default (token: Theme) => {
  const galleryBackground = css`
    border: 1px solid ${token.colorBorderSecondary} !important;
    border-radius: ${token.borderRadius}px !important;

    background-color: ${token.colorBgContainer};
    background-image:
      linear-gradient(45deg, ${token.colorFillTertiary} 25%, transparent 25%),
      linear-gradient(-45deg, ${token.colorFillTertiary} 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, ${token.colorFillTertiary} 75%),
      linear-gradient(-45deg, transparent 75%, ${token.colorFillTertiary} 75%);
    background-position:
      0 0,
      0 10px,
      10px -10px,
      -10px 0;
    background-size: 20px 20px;
  `;
  return css`
    .gradio-gallery { position: relative; }
    .gradio-gallery > .empty {
      position: absolute !important;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      height: 100% !important;
      min-height: 0 !important;
    }
    .lobe-gallery-empty-feedback {
      position: absolute;
      top: calc(50% + 24px);
      left: 50%;
      transform: translateX(-50%);
      width: min(280px, calc(100% - 32px));
      font-size: 13px;
      line-height: 20px;
      text-align: center;
      color: ${token.colorTextSecondary};
      pointer-events: none;
      &[hidden] { display: none; }
    }
    .gradio-gallery > .empty > .lobe-gallery-empty-feedback {
      position: static;
      transform: none;
    }
    [id^='image_buttons_'] button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
    .livePreview,
    .gradio-gallery,
    .gradio-image,
    .gradio-video,
    .gradio-file {
      ${galleryBackground}
    }

    div.block {
      &.livePreview,
      &.gradio-gallery,
      &.gradio-image,
      &.gradio-video,
      &.gradio-file {
        ${galleryBackground}
      }
    }

    div.block,
    .gradio-row,
    .gradio-column {
      .livePreview,
      .gradio-gallery,
      .gradio-image,
      .gradio-video,
      .gradio-file {
        ${galleryBackground}
      }
    }

    .block.gradio-gallery {
      .thumbnail-item {
        position: relative;
        background: ${token.colorBgContainer} !important;
        box-shadow: none;

        &.thumbnail-small {
          transform: none;
          border-radius: 4px;
          transition: var(--button-transition);
        }

        &.thumbnail-lg {
          border-radius: 5px;
          transition: var(--button-transition);
        }

        &:hover {
          box-shadow: inset 0 0 0 1px ${token.colorBorder};
        }

        &.thumbnail-small:hover {
          transform: none;
          box-shadow: 0 0 0 1px ${token.colorBorder};
        }
      }

      > .grid-wrap {
        margin: 0;
        padding: 8px;
        border-radius: ${token.borderRadius}px;
      }
    }

    [id$='_gallery_container'] {
      min-height: min(470px, 60dvh);

      > .lobe-split-action-header {
        flex: 0 0 auto !important;
      }
      > div:not([id$='_generate_box'], .lobe-split-action-header) {
        flex-grow: 1;

        [id$='_gallery'] {
          flex-grow: 1;
        }
      }
    }

    .gradio-gallery {
      background-image: none !important;
      min-width: 0;
      .preview {
        background-color: ${token.colorBgContainer} !important;
        backdrop-filter: none;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
        box-sizing: border-box;
        padding-bottom: 56px;

        > .image-button {
          display: flex;
          flex: 1 1 0;
          align-items: center;
          justify-content: center;
          min-height: 0;
          width: 100%;
          height: auto !important;
        }
        > .caption {
          flex: 0 0 auto;
          width: 100%;
          max-height: 36px;
          box-sizing: border-box;
          overflow: hidden;
          padding: 6px 12px;
          font-size: 12px;
          line-height: 1.5;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        > .thumbnails {
          position: absolute;
          inset: auto 0 0;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 6px;
          height: 56px;
          padding: 8px;
          box-sizing: border-box;
          overflow: auto hidden;
          background: ${token.colorBgContainer};
          border-top: 1px solid ${token.colorBorderSecondary};
          .thumbnail-small {
            flex: 0 0 40px;
            width: 40px;
            height: 40px;
            margin: 0;
            overflow: hidden;
            &:first-child {
              margin-left: auto;
            }
            &:last-child {
              margin-right: auto;
            }
          }
        }

        img {
          max-height: 100% !important;
          max-width: 100% !important;
          object-fit: contain !important;
          border-radius: ${token.borderRadiusSM}px;
        }
      }

      .button-preview {
        border-radius: ${token.borderRadiusSM}px !important;
      }
      .preview > .icon-buttons {
        position: absolute !important;
        z-index: 3;
        top: 8px !important;
        right: 8px !important;
        bottom: auto !important;
        left: auto !important;
        display: flex;
        align-items: center;
        gap: 4px;
        > div {
          position: static !important;
          display: flex;
        }
        button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          min-width: 32px !important;
          height: 32px;
          margin: 0 !important;
          padding: 0 !important;
          border: 1px solid ${token.colorBorderSecondary};
          border-radius: ${token.borderRadiusSM}px;
          background: ${token.colorBgContainer};
          svg {
            width: 16px;
            height: 16px;
          }
        }
      }
      .thumbnail-item.selected {
        outline: 2px solid ${token.colorPrimary};
        outline-offset: -2px;
      }
    }
  `;
};
