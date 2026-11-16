import * as icons from '@/icons/tablerPaths';
import { svgIcon } from '@/icons/native';
import { isPromptOutputMutation } from '@/utils/promptMutations';

const symbols: Record<string, string> = {
  '×': icons.x, '↕': icons.sortDescending, '↙': icons.fileArrowLeft, '↩': icons.arrowBackUp,
  '⇄': icons.arrowsExchange, '⇅': icons.arrowsUpDown, '⊞': icons.gridDots, '♻': icons.recycle,
  '⚙': icons.settings, '✨': icons.photoUp, '❮': icons.chevronLeft,
  '❯': icons.chevronRight, '➡': icons.arrowRight, '⤡': icons.zoomInArea, '⤴': icons.cornerRightUp,
  '⬇': icons.arrowDown, '🌀': icons.rotateClockwise2, '🎨': icons.brush, '🎲': icons.dice5,
  '🎴': icons.cards, '💞': icons.share, '💥': icons.playerPlay,
  '💾': icons.deviceFloppy, '📂': icons.folderOpen, '📋': icons.clipboardText, '📎': icons.paperclip,
  '📐': icons.dimensions, '📒': icons.book, '📝': icons.typography, '📦': icons.box,
  '📷': icons.camera, '🔁': icons.clipboardText, '🔄': icons.refresh, '🖌': icons.palette,
  '🖫': icons.download, '🖼': icons.photo, '🗃': icons.fileZip,
  '🗑': icons.trash, '🪄': icons.wand,
};

const forgeActions: [RegExp, string][] = [
  [/^(?:txt2img_|img2img_)?paste$/, icons.fileArrowLeft],
  [/_restore_progress$/, icons.rotateClockwise2],
  [/_clear_prompt$/, icons.eraser],
  [/_styles?_apply(?:_dialog)?$/, icons.clipboardText],
  [/_styles_edit_button$/, icons.palette],
  [/_random_(?:sub)?seed$/, icons.dice5],
  [/_reuse_(?:sub)?seed$/, icons.recycle],
  [/_styles?_copy$/, icons.fileImport],
  [/_send_to_txt2img$/, icons.typography],
  [/_send_to_img2img$/, icons.photoEdit],
  [/_send_to_inpaint_sketch$/, icons.scribble],
  [/_send_to_inpaint$/, icons.brush],
  [/_send_to_extras$/, icons.photoSpark],
  [/_open_folder$/, icons.folderOpen],
  [/^save_zip_(?:txt2img|img2img)$/, icons.fileZip],
  [/^save_(?:txt2img|img2img)$/, icons.download],
  [/_upscale$/, icons.photoUp],
  [/_generation_(extras|logs)$/, icons.fileInfo],
];

const adetailer: Record<string, string> = {
  ad_apply_btn: icons.wand, ad_apply_same_folder: icons.folderCheck,
  ad_apply_save: icons.photoDown, ad_copy_settings: icons.copy, ad_paste_settings: icons.clipboardCheck,
  ad_preset_delete: icons.trash, ad_preset_export_btn: icons.fileExport,
  ad_preset_import_btn: icons.fileImport, ad_preset_load: icons.folderOpen,
  ad_preset_rename: icons.edit, ad_preset_reset: icons.rotate2,
  ad_preset_save: icons.deviceFloppy, ad_preview_all_tabs: icons.layersUnion, ad_preview_btn: icons.scanEye,
};

const guide: Record<string, string> = {
  '⚙': icons.settings, '✍': icons.typography, '🎨': icons.palette, '🎯': icons.targetArrow,
  '📖': icons.book, '🔎': icons.scan, '🔡': icons.bracketsContain, '🖌': icons.brush,
  '🚀': icons.rocket, '🛠': icons.tools, '🧰': icons.briefcase,
};

const controls = 'button, a, label, label span, .ad-guide-section :is(summary, .label-wrap span), .modalControls span, span.close, span.modalClose';
const excluded = '.extra-network-cards, .lobe-inline-icon';
const themeOwned = '[data-lobe-localized]';
const nativeContent = '[data-lobe-native-content]';
const ownership = `${themeOwned}, ${nativeContent}`;
const isThemeOwned = (element: Element) => element.closest(ownership)?.matches(themeOwned);
const leadingEmoji = /^[\p{Extended_Pictographic}\p{Emoji_Presentation}]\uFE0F?\s*/u;
const clean = (text: string) => text.replaceAll(/[\uFE0E\uFE0F]/g, '');
const originals = new WeakMap<Text, string>();

function replace(element: HTMLElement) {
  if (element.closest(excluded) || isThemeOwned(element)) return;
  const node = [...element.childNodes].find((child): child is Text =>
    child instanceof Text && Boolean(child.data.trim()));
  if (!node) return;

  const text = node.data.trim();
  if (originals.get(node) === text && element.querySelector(':scope > .lobe-inline-icon')) return;
  const host = element.closest('[id*="adetailer_ad_"], [id^="ad_"]');
  const key = host?.id.replace(/^script_(?:txt2img|img2img)_adetailer_/, '').replace(/_\d+(?:st|nd|rd|th)$/, '');
  const adIcon = key ? adetailer[key] : undefined;
  const prefix = text.match(leadingEmoji)?.[0] ?? '';
  const guideIcon = (element.closest('.ad-guide-section') ||
    (/quick start|adetailer guide/i.test(text) && element.matches('button'))) ? guide[clean(prefix.trim())] : undefined;
  const symbol = clean(text);
  const icon = adIcon || guideIcon || (symbols[symbol] &&
    (element.matches('button, a, .modalControls span, span.close, span.modalClose')) &&
    (forgeActions.find(([pattern]) => pattern.test(element.id))?.[1] || symbols[symbol]));
  if (!icon) return;
  if (!adIcon && !guideIcon && element.textContent?.trim() !== text) return;

  const dict = (window as Window & { localization?: Record<string, unknown> }).localization;
  const translated = dict?.[text];
  const label = adIcon || guideIcon
    ? (typeof translated === 'string' ? translated : text).replace(leadingEmoji, '').trim()
    : '';

  element.querySelector(':scope > .lobe-inline-icon')?.remove();
  const decoration = document.createElement('span');
  decoration.className = 'lobe-inline-icon';
  decoration.setAttribute('aria-hidden', 'true');
  decoration.innerHTML = svgIcon(icon);
  if (!label && !element.hasAttribute('aria-label')) {
    element.setAttribute('aria-label', element.title || text);
  }
  node.before(decoration);
  // Gradio still owns this text node and can update it when the control changes.
  node.data = label;
  originals.set(node, label);
}

function scan(node: ParentNode) {
  if (node instanceof HTMLElement && node.matches(controls)) replace(node);
  if (
    node instanceof Element &&
    (node.closest(excluded) || (isThemeOwned(node) && !node.querySelector(nativeContent)))
  )
    return;
  node.querySelectorAll<HTMLElement>(controls).forEach(replace);
}

export default function replaceIcons() {
  const root = (typeof gradioApp === 'function' ? gradioApp() : null) ?? document;

  scan(root);
  const observer = new MutationObserver((records) => {
    const changed = new Set<Element>();
    for (const record of records) {
      if (isPromptOutputMutation(record)) continue;
      const host = record.target instanceof Element ? record.target : record.target.parentElement;
      if (host?.closest(excluded)) continue;
      const control = host?.closest(controls);
      if (control && !isThemeOwned(control)) changed.add(control);
      for (const node of record.addedNodes) if (node instanceof Element) changed.add(node);
    }
    changeControls: for (const node of changed) {
      if (!node.isConnected) continue;
      for (let parent = node.parentElement; parent; parent = parent.parentElement) {
        if (changed.has(parent)) continue changeControls;
      }
      scan(node);
    }
  });
  observer.observe(root, { characterData: true, childList: true, subtree: true });
  return () => observer.disconnect();
}
