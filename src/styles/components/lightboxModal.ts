import { Theme, css } from 'antd-style';

import {
  ActualSize,
  ChevronLeft,
  ChevronRight,
  DeviceTv,
  Tiling,
  X,
  iconMask,
} from '@/icons/native';
import { aspectRatio, download } from '@/icons/tablerPaths';

export default (token: Theme) => css`
  #lightboxModal {
    position: fixed;
    z-index: 10000;
    inset: 0;
    box-sizing: border-box;
    width: 100%;
    height: 100dvh;
    padding: max(64px, calc(env(safe-area-inset-top) + 56px)) 56px
      max(48px, calc(env(safe-area-inset-bottom) + 40px));
    overflow: hidden;
    background-color: #141414 !important;
    overscroll-behavior: contain;

    .lobe-viewer-stage {
      display: flex;
      flex: 1;
      min-width: 0;
      min-height: 0;
      overflow: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
    }
    #modalImage {
      display: block;
      flex: none;
      width: auto;
      height: auto;
      max-width: none;
      max-height: none;
      margin: auto;
      user-select: none;
      &.modalImageFullscreen {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .modalControls {
      position: absolute !important;
      inset: max(8px, env(safe-area-inset-top)) max(8px, env(safe-area-inset-right))
        auto max(8px, env(safe-area-inset-left)) !important;
      display: flex !important;
      align-items: center;
      gap: 4px;
      width: auto !important;
      max-width: none !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 4px !important;
      box-sizing: border-box;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusLG}px;
      background: ${token.colorBgElevated} !important;
    }

    .modalControls > span,
    .modalPrev,
    .modalNext {
      display: inline-grid !important;
      place-items: center;
      flex: 0 0 38px;
      width: 38px !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: 38px !important;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: ${token.borderRadius}px !important;
      color: ${token.colorTextSecondary} !important;
      background: transparent;
      font-size: 0 !important;
      line-height: 1;
      text-shadow: none !important;
      cursor: pointer;
      transition: background-color 150ms, color 150ms;
      &::before {
        width: 20px;
        height: 20px;
        background: currentColor;
        mask: var(--lobe-viewer-icon) center / contain no-repeat;
        content: '';
      }
      > svg { display: none; }
      &:hover,
      &:focus-visible {
        color: ${token.colorText} !important;
        background: ${token.colorFillSecondary};
      }
      &[aria-pressed='true'] {
        color: ${token.colorPrimaryText} !important;
        background: ${token.colorPrimaryBg};
      }
    }
    .modalControls > span {
      position: static !important;
      &[style*='display: none'] { display: none !important; }
    }
    .modalZoom {
      --lobe-viewer-icon: ${iconMask(ActualSize)};
      &[aria-pressed='true'] { --lobe-viewer-icon: ${iconMask(aspectRatio)}; }
    }
    .modalTileImage { --lobe-viewer-icon: ${iconMask(Tiling)}; }
    .modalToggleLivePreview { --lobe-viewer-icon: ${iconMask(DeviceTv)}; }
    .modalControls .modalSave {
      --lobe-viewer-icon: ${iconMask(download)};
      order: 1;
      margin-left: auto;
    }
    .modalControls .modalClose {
      --lobe-viewer-icon: ${iconMask(X)};
      order: 2;
      margin-inline-start: 0;
    }
    .modalControls:has(.modalSave[style*='display: none']) .modalClose {
      margin-inline-start: auto;
    }

    .modalPrev,
    .modalNext {
      position: absolute;
      inset: 50% auto auto auto;
      transform: translateY(-50%) !important;
      border: 1px solid ${token.colorBorderSecondary};
      background: ${token.colorBgElevated};
      &:hover, &:focus-visible {
        background: ${token.colorBgContainer};
      }
    }
    .modalPrev {
      --lobe-viewer-icon: ${iconMask(ChevronLeft)};
      left: 8px;
    }
    .modalNext {
      --lobe-viewer-icon: ${iconMask(ChevronRight)};
      right: 8px;
    }
    .lobe-viewer-size {
      position: absolute;
      bottom: max(8px, env(safe-area-inset-bottom));
      left: 50%;
      padding: 4px 10px;
      transform: translateX(-50%);
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusLG}px;
      background: ${token.colorBgElevated};
      color: ${token.colorTextSecondary};
      font-size: 12px;
      font-variant-numeric: tabular-nums;
      pointer-events: none;
    }

    @media (max-width: 575px) {
      padding-inline: 8px;
      padding-bottom: max(56px, calc(env(safe-area-inset-bottom) + 48px));
      .modalPrev,
      .modalNext {
        top: auto !important;
        bottom: max(8px, env(safe-area-inset-bottom));
        transform: none !important;
      }
      .lobe-viewer-size { bottom: max(12px, calc(env(safe-area-inset-bottom) + 4px)); }
    }
  }
`;
