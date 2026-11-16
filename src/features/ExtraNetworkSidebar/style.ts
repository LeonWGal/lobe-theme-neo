import { createStyles } from 'antd-style';

import {
  ArrowDownWideNarrow, CalendarPlus, CalendarTime, Copy, FileSettings, FolderSearch, Info, PhotoOff, RefreshCcw, Search, SortAZ, SortAscending, Tree, iconMask,
} from '@/icons/native';
import { externalLink, messageCode, pencil, photoUp, sparkles, trashX } from '@/icons/tablerPaths';

export const useStyles = createStyles(({ css, token }, { size = 112 }: { size?: number }) => ({
  body: css`
    flex: 1 1 0;
    min-height: 0;
    padding: 0;
    overflow: hidden auto;
    overscroll-behavior-y: auto;
    scrollbar-gutter: stable;

    .lobe-network-pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 8px 12px 12px;
      output {
        font-size: 12px;
        color: ${token.colorTextSecondary};
      }
      button {
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        padding: 0;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusSM}px;
        color: ${token.colorText};
        background: ${token.colorFillQuaternary};
        font-size: 20px;
        &:disabled {
          opacity: 0.35;
          cursor: default;
        }
      }
    }
    .lobe-network-folders {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      input {
        flex: 1;
        min-width: 0;
        height: 32px;
        padding: 4px 8px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusSM}px;
        color: ${token.colorText};
        background: ${token.colorFillQuaternary};
      }
      button {
        height: 32px;
        padding: 4px 8px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusSM}px;
        &[aria-current] {
          color: var(--lobe-accent-text);
          border-color: ${token.colorPrimaryBorder};
        }
      }
    }

    .lobe-network-folder-tree {
      flex: 1 0 100%;
      max-height: clamp(140px, 32dvh, 360px);
      min-width: 0;
      overflow: auto;
      overscroll-behavior: contain;
      scrollbar-gutter: stable;
      padding: 4px;
      border: 1px solid var(--lobe-border);
      border-radius: var(--lobe-radius);
      background: var(--lobe-color-bg-layout);
      color: var(--lobe-text);
      button {
        display: block;
        box-sizing: border-box;
        width: 100%;
        min-width: 0 !important;
        min-height: 26px;
        padding: 3px 6px;
        border: 0;
        border-radius: var(--lobe-radius-sm);
        text-align: start;
        overflow-wrap: anywhere;
        background: transparent;
        color: inherit;
        cursor: pointer;
        &:hover { background: var(--lobe-field); }
        &:focus-visible { outline-offset: -2px !important; }
        &[aria-current] { color: var(--lobe-accent-text); background: var(--lobe-field); }
      }
      .lobe-network-folder-row {
        display: flex;
        align-items: start;
        gap: 2px;
        > button:last-child { flex: 1; }
      }
      .lobe-network-folder-toggle {
        flex: 0 0 24px;
        width: 24px;
        text-align: center;
        padding-inline: 0;
        svg { vertical-align: middle; }
        &[aria-expanded='true'] svg { rotate: 90deg; }
      }
      .lobe-network-folder-leaf { padding-inline-start: 30px; }
      .lobe-network-folder-children {
        margin-inline-start: 12px;
        padding-inline-start: 4px;
        border-inline-start: 1px solid var(--lobe-border);
        &[hidden] { display: none; }
      }
    }

    .hide {
      display: none;
    }
    [id$='_extra_tabs'] {
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: auto !important;
      .pending {
        opacity: 1 !important;
      }
      .wrap.center.full.translucent {
        display: none !important;
      }
      > .tab-nav {
        position: sticky;
        top: 8px;
        z-index: 4;
        display: flex;
        flex-wrap: wrap;
        flex: 0 0 auto;
        box-sizing: border-box;
        gap: 2px;
        align-items: center;
        padding: 3px;
        margin: 10px 12px 6px;
        border: 1px solid var(--lobe-border);
        border-radius: var(--lobe-radius);
        background: var(--lobe-field);
        > button {
          position: relative;
          flex: 1 1 max-content;
          min-width: 0 !important;
          min-height: 28px;
          height: auto;
          white-space: nowrap;
          margin: 0 !important;
          padding: 4px 8px !important;
          border: 0 !important;
          border-radius: var(--lobe-radius-sm) !important;
          box-shadow: none !important;
          background: transparent !important;
          color: var(--lobe-text-muted) !important;
          font-size: 13px !important;
          font-weight: 500;
          transition: color 0.15s ease, background-color 0.15s ease;
          &:first-child { display: none; }
          &:focus-visible { outline-offset: -2px !important; }
          &:hover { color: var(--lobe-text) !important; background: transparent !important; }
          &:is(.selected, [aria-selected='true']) {
            background: var(--lobe-surface) !important;
            color: var(--lobe-text) !important;
            font-weight: 500;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08) !important;
          }
        }
      }
      .extra-networks-controls-div {
        position: static !important;
        flex: 0 0 100%;
        width: 100%;
        min-width: 0;
        height: auto !important;
        margin: 4px 0 0 !important;
      }
      .extra-network-control {
        position: static !important;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        height: auto !important;
        min-width: 0;
        .extra-network-control--icon {
          background-color: ${token.colorText} !important;
        }
        [data-sortkey="default"] i { mask: ${iconMask(FolderSearch)} center / contain no-repeat !important; }
        [data-sortkey="name"] i { mask: ${iconMask(SortAZ)} center / contain no-repeat !important; }
        [data-sortkey="date_created"] i { mask: ${iconMask(CalendarPlus)} center / contain no-repeat !important; }
        [data-sortkey="date_modified"] i { mask: ${iconMask(CalendarTime)} center / contain no-repeat !important; }
        [data-sortdir="Ascending"] i { mask: ${iconMask(SortAscending)} center / contain no-repeat !important; }
        [data-sortdir="Descending"] i { mask: ${iconMask(ArrowDownWideNarrow)} center / contain no-repeat !important; }
        .extra-network-control--tree-view i { mask: ${iconMask(Tree)} center / contain no-repeat !important; }
        .extra-network-control--refresh i { mask: ${iconMask(RefreshCcw)} center / contain no-repeat !important; }
        .extra-network-control--enabled .extra-network-control--icon {
          background-color: ${token.colorPrimary} !important;
        }
        small {
          display: none;
        }
        .extra-network-control--search {
          flex: 0 0 100%;
          width: 100%;
          margin-bottom: 2px;
          &::before {
            width: 16px;
            height: 16px;
            background: ${token.colorTextSecondary};
            mask: ${iconMask(Search)} center / contain no-repeat;
            content: '';
            pointer-events: none;
          }
          input {
            width: 100% !important;
            height: 32px !important;
            min-height: 32px !important;
            box-sizing: border-box;
            font-size: var(--lobe-type-ui);
          }
        }
        > div:has(i) {
          position: static !important;
          display: flex;
          flex: 0 0 30px;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          padding: 0;
          border-radius: ${token.borderRadiusSM}px;
          background: ${token.colorFillQuaternary};
          i {
            width: 18px;
            height: 18px;
          }
        }
      }
      .extra-network-pane > .extra-network-control {
        padding: 6px 10px;
        border-bottom: 1px solid var(--lobe-border);
        background: var(--lobe-surface);
      }
      .lobe-network-location {
        flex: 0 0 100%;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font: 500 var(--lobe-type-meta)/var(--lobe-leading-meta) var(--lobe-font-family);
        color: var(--lobe-text-muted);
      }
      .extra-network-tree .tree-list-content-dir button {
        padding: 2px 4px;
        border: 0;
        color: inherit;
        background: transparent;
        text-align: start;
        min-width: 0 !important;
      }
      .extra-network-tree .tree-list-content-dir button[aria-expanded] {
        width: 24px;
        text-align: center;
        &[aria-expanded='true'] { rotate: 90deg; }
      }
      .tabitem {
        position: relative;
        padding: 0 !important;
        background: transparent;
      }
      .extra-network-pane {
        resize: none;
        height: auto !important;
        min-height: 0;
        overflow: visible !important;
      }
      .extra-network-pane-content-dirs,
      .extra-network-pane-content-tree {
        height: auto !important;
        min-height: 0;
        overflow: visible !important;
      }
      .extra-network-pane-content-tree {
        display: flex !important;
        flex-direction: column;
        > .resize-handle { display: none !important; }
      }
      .extra-network-subdirs,
      .extra-network-dirs {
        position: static !important;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        height: auto !important;
        padding: 4px 12px 8px !important;
        margin: 0 !important;
        > button.lg.secondary.gradio-button {
          zoom: 1;
          flex: 0 0 auto !important;
          min-width: 0 !important;
          height: 28px !important;
          min-height: 28px !important;
          max-height: 28px !important;
          padding: 4px 7px !important;
          margin: 0 !important;
          font-size: 0.8125rem !important;
          line-height: 1.2;
        }
      }
      .extra-network-cards {
        display: grid;
        grid-template-columns: repeat(
          auto-fill,
          minmax(min(100%, ${size}px), 1fr)
        );
        flex: none !important;
        align-content: start;
        justify-content: center;
        gap: 8px;
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
        padding: 0 12px 12px;
        border: 0 !important;
        &:has(.nocards) {
          display: block;
          .nocards {
            margin-block: 12px;
            padding: 16px 12px;
            border: 1px dashed var(--lobe-border);
            border-radius: var(--lobe-radius);
            color: var(--lobe-text-muted);
            text-align: center;
            & :is(h1, h2, h3, h4) {
              margin: 0;
              color: var(--lobe-text);
              font-size: var(--lobe-type-ui);
            }
            ul { margin-block: 8px 0; padding-inline-start: 16px; text-align: start; }
            li { overflow-wrap: anywhere; }
          }
        }
      }
      .extra-network-tree {
        flex: 0 1 auto !important;
        max-height: clamp(140px, 32dvh, 360px);
        min-width: 0;
        margin: 8px 10px;
        padding: 4px;
        overflow: hidden auto !important;
        overscroll-behavior: contain;
        scrollbar-gutter: stable;
        background: var(--lobe-color-bg-layout);
        border: 1px solid var(--lobe-border);
        border-radius: var(--lobe-radius);
        .tree-list { margin: 0; overflow: visible; }
        .tree-list[hidden] { display: none !important; }
        .tree-list-content {
          min-height: 26px;
          color: var(--lobe-text);
          border-radius: var(--lobe-radius-sm);
          &[data-selected] { color: var(--lobe-accent-text); background: var(--lobe-field); }
        }
        .tree-list-item-label { overflow-wrap: anywhere; white-space: normal; }
      }
      .extra-network-dirs-hidden .extra-network-dirs,
      .extra-network-dirs-hidden .extra-network-tree {
        display: none;
      }

      .card {
        --lobe-card-caption-height: calc(2.5rem + 4px);
        position: relative;
        display: block;
        box-sizing: border-box;
        content-visibility: auto;
        width: 100% !important;
        height: calc(${Math.round(size * 1.04)}px + 1rem) !important;
        min-width: 0;
        margin: 0 !important;
        overflow: hidden;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadius}px;
        background: ${token.colorFillQuaternary} !important;
        box-shadow: none !important;
        transition: border-color 150ms;

        &::before {
          position: absolute;
          top: calc((100% - var(--lobe-card-caption-height)) / 2);
          left: 50%;
          width: 26px;
          height: 26px;
          transform: translate(-50%, -50%);
          background: ${token.colorTextQuaternary};
          mask: ${iconMask(PhotoOff)} center / contain no-repeat;
          content: '';
          pointer-events: none;
        }
        &:has(> .preview)::before {
          display: none;
        }
        > .preview {
          position: absolute;
          inset: 0 0 auto;
          width: 100%;
          height: 100% !important;
          border-radius: 0;
          object-fit: cover;
          object-position: center 35%;
        }
        .actions {
          position: absolute;
          inset: auto 0 0;
          display: flex;
          align-items: center;
          height: var(--lobe-card-caption-height);
          box-sizing: border-box;
          padding: 0 8px;
          background: ${token.colorBgContainer} !important;
          color: ${token.colorText} !important;
          text-shadow: none !important;
          box-shadow: none !important;
          html[data-lobe-lite-effects='false'] & {
            background: color-mix(in srgb, var(--lobe-surface) 81%, transparent) !important;
            backdrop-filter: saturate(120%) blur(5px);
          }
          .name {
            display: -webkit-box;
            width: 100%;
            min-width: 0;
            overflow: hidden;
            white-space: normal;
            overflow-wrap: anywhere;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            font-size: var(--lobe-type-ui) !important;
            line-height: var(--lobe-leading-ui) !important;
            font-weight: 600;
            color: ${token.colorText} !important;
            background: none !important;
          }
          .description {
            display: none !important;
          }
          .additional {
            position: absolute !important;
            inset: auto auto calc(100% + 4px) 4px;
            z-index: 3;
            max-width: calc(100% - 8px);
            display: none;
            pointer-events: none;
            ul {
              display: flex;
              flex-wrap: wrap;
              justify-content: flex-start;
              gap: 2px;
              margin: 0;
              padding: 2px;
              border-radius: ${token.borderRadius}px;
              background: ${token.colorBgElevated};
            }
            br { display: none; }
            a:is(.replacepreview, .openurl, .addtriggerwords, .usepreviewprompt, .renamecard, .removecard, [data-lobe-civitai-icon]) {
              display: inline-grid !important;
              place-items: center;
              pointer-events: auto;
              flex: 0 0 26px;
              width: 26px;
              height: 26px;
              padding: 0 !important;
              margin: 0 !important;
              border-radius: ${token.borderRadiusSM}px !important;
              background: ${token.colorBgElevated};
              color: ${token.colorTextSecondary} !important;
              font-size: 0 !important;
              text-shadow: none !important;
              &::before {
                width: 16px;
                height: 16px;
                background: currentColor;
                mask: var(--lobe-helper-icon) center / contain no-repeat;
                content: '';
              }
              > svg, > .lobe-helper-icon-label { display: none !important; }
              &:hover, &:focus-visible {
                background: ${token.colorFillSecondary};
                color: var(--lobe-accent-text) !important;
              }
              &.removecard:hover, &.removecard:focus-visible { color: ${token.colorError} !important; }
            }
            a:is(.replacepreview, [data-lobe-civitai-icon='preview']) { --lobe-helper-icon: ${iconMask(photoUp)}; }
            a:is(.openurl, [data-lobe-civitai-icon='url']) { --lobe-helper-icon: ${iconMask(externalLink)}; }
            a:is(.addtriggerwords, [data-lobe-civitai-icon='trigger']) { --lobe-helper-icon: ${iconMask(sparkles)}; }
            a:is(.usepreviewprompt, [data-lobe-civitai-icon='prompt']) { --lobe-helper-icon: ${iconMask(messageCode)}; }
            .renamecard { --lobe-helper-icon: ${iconMask(pencil)}; }
            .removecard { --lobe-helper-icon: ${iconMask(trashX)}; }
          }
        }
        &:focus-visible:has(.name) {
          overflow: visible;
          content-visibility: visible;
          z-index: 3;
        }
        &:focus-visible .actions:has(.name) {
          height: auto;
          min-height: var(--lobe-card-caption-height);
          padding-block: 4px;
          background: var(--lobe-surface) !important;
          .name { -webkit-line-clamp: unset; }
        }

        .button-row {
          position: absolute;
          inset: 4px auto auto 4px;
          max-width: calc(100% - 8px);
          z-index: 2;
          display: flex !important;
          flex-wrap: wrap;
          gap: 2px;
          padding: 2px;
          visibility: hidden;
          opacity: 0;
          pointer-events: none;
          border: 1px solid ${token.colorBorderSecondary};
          border-radius: ${token.borderRadius}px;
          background: ${token.colorBgElevated};
          &:empty { display: none !important; }
          .card-button {
            display: grid;
            place-items: center;
            width: clamp(18px, ${size / 4}px, 28px);
            height: clamp(18px, ${size / 4}px, 28px);
            padding: 0;
            color: ${token.colorTextSecondary} !important;
            border-radius: ${token.borderRadiusSM}px;
            text-shadow: none !important;
            &:hover, &:focus-visible {
              color: var(--lobe-accent-text) !important;
              background: ${token.colorFillTertiary};
            }
            &::before {
              width: 17px;
              height: 17px;
              background: currentColor;
              mask: var(--lobe-card-action-icon) center / contain no-repeat;
              content: '';
            }
          }
          .copy-path-button { --lobe-card-action-icon: ${iconMask(Copy)}; }
          .metadata-button { --lobe-card-action-icon: ${iconMask(Info)}; }
          .edit-button { --lobe-card-action-icon: ${iconMask(FileSettings)}; }
        }
        .lobe-lora-corner {
          flex-direction: row;
          align-items: center;
        }
        .lobe-lora-controls {
          position: absolute;
          inset: auto auto calc(100% + 4px) 4px;
          z-index: 2;
          max-width: calc(100% - 8px);
          margin: 0;
          background: ${token.colorBgElevated};
          border: 1px solid ${token.colorBorderSecondary};
          button {
            min-width: 20px;
            height: 26px;
            color: ${token.colorText} !important;
            &:hover, &:focus-visible {
              color: var(--lobe-accent-text) !important;
              background: ${token.colorFillTertiary};
            }
          }
          .value {
            min-width: 28px;
          }
        }
        &:has(.lobe-lora-controls) .additional {
          bottom: calc(100% + 34px);
        }
        &:hover,
        &:focus-within {
          border-color: ${token.colorPrimary};
          .button-row {
            visibility: visible;
            opacity: 1;
            pointer-events: auto;
          }
          .additional:has(a) {
            display: block !important;
          }
        }
      }
      @media (hover: none) {
        .card .button-row,
        .card .additional:has(a[onclick]) {
          display: flex !important;
          visibility: visible;
          opacity: 1;
          pointer-events: auto;
        }
      }
      @media (hover: hover) {
        .card:not(:hover, :focus-within) .lobe-lora-controls {
          visibility: hidden;
          pointer-events: none;
        }
      }
    }
  `,
}));
