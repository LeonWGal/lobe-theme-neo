import { consola } from 'consola';
import {
  ArchiveRestore,
  ArrowDown,
  ArrowDownLeft,
  ArrowDownWideNarrow,
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  ArrowUpDown,
  Book,
  Box,
  Brush,
  ClipboardList,
  CornerRightUp,
  Dices,
  Download,
  FileArchive,
  FolderClosed,
  Grid2x2,
  Image,
  Laptop2,
  Maximize,
  PanelRight,
  Paperclip,
  PencilRuler,
  Play,
  RefreshCcw,
  Save,
  Scaling,
  Settings,
  Share2,
  SquarePen,
  Trash,
  Undo,
  Wand2,
  Webcam,
  X,
} from 'lucide-static';

const createSvgHtml = (svg: string, size: number) =>
  svg.replace(`width="24"`, `width="${size}"`).replace(`height="24"`, `height="${size}"`);

const replaceIcon = (element: HTMLElement, emoji: string[], svg: string, size: number) => {
  if (!element?.textContent || !svg) return;
  const raw = element.textContent.trim();
  const svgHtml = createSvgHtml(svg, size);

  for (const e of emoji) {
    if (!element.textContent.includes(e)) continue;

    // If element only contains the emoji (icon-only button / tool)
    if (
      raw === e ||
      element.classList.contains('tool') ||
      element.classList.contains('icon-only')
    ) {
      element.innerHTML = svgHtml;
      return;
    }

    // If button has text + emoji, replace ONLY the emoji character, preserving labels/translations
    if (element.innerHTML.includes(e)) {
      const wrapped = `<span class="lobe-svg-inline" style="display:inline-flex;align-items:center;vertical-align:middle;margin-right:4px;">${svgHtml}</span>`;
      element.innerHTML = element.innerHTML.replace(e, wrapped);
    }
  }
};

// Extra-network cards (LoRA/checkpoints/...) can number in the thousands and never
// contain the toolbar emoji we replace here. Skipping their subtree avoids iterating
// tens of thousands of nodes on startup, which otherwise freezes the UI.
const isInExtraNetworkCard = (element: HTMLElement) => !!element.closest('.extra-network-cards');

export default () => {
  for (const button of document.querySelectorAll('button')) {
    if (isInExtraNetworkCard(button)) continue;
    replaceIcon(button, ['🖌️'], SquarePen, 16);
    replaceIcon(button, ['🗃️'], FileArchive, 16);
    replaceIcon(button, ['🖼️'], Image, 16);
    replaceIcon(button, ['🎨️', '🎨'], Brush, 16);
    replaceIcon(button, ['📂'], FolderClosed, 16);
    replaceIcon(button, ['🔄', '🔁', '♻️'], RefreshCcw, 16);
    replaceIcon(button, ['↙️', '↙'], ArrowDownLeft, 16);
    replaceIcon(button, ['⤴'], CornerRightUp, 16);
    replaceIcon(button, ['↕️', '↕'], ArrowDownWideNarrow, 16);
    replaceIcon(button, ['🗑️', '🗑'], Trash, 16);
    replaceIcon(button, ['📋'], ClipboardList, 16);
    replaceIcon(button, ['💾'], Save, 16);
    replaceIcon(button, ['🎲️', '🎲'], Dices, 16);
    replaceIcon(button, ['🪄'], Wand2, 16);
    replaceIcon(button, ['⚙️', '⚙'], Settings, 16);
    replaceIcon(button, ['➡️', '➡'], ArrowRight, 16);
    replaceIcon(button, ['⇅'], ArrowUpDown, 16);
    replaceIcon(button, ['⇄'], ArrowRightLeft, 16);
    replaceIcon(button, ['🎴'], PanelRight, 16);
    replaceIcon(button, ['🌀'], ArchiveRestore, 16);
    replaceIcon(button, ['💥'], Play, 16);
    replaceIcon(button, ['📷'], Webcam, 16);
    replaceIcon(button, ['📝'], Laptop2, 16);
    replaceIcon(button, ['📐'], PencilRuler, 16);
    replaceIcon(button, ['⬇️', '⬇'], ArrowDown, 16);
    replaceIcon(button, ['↩'], Undo, 16);
    replaceIcon(button, ['📒'], Book, 16);
    replaceIcon(button, ['📎'], Paperclip, 16);
    replaceIcon(button, ['📦'], Box, 16);
    replaceIcon(button, ['💞'], Share2, 16);
    replaceIcon(button, ['✨'], Scaling, 16);
  }

  for (const span of document.querySelectorAll('span')) {
    if (isInExtraNetworkCard(span)) continue;
    const text = span.textContent?.trim();
    if (text === '⤡') replaceIcon(span, ['⤡'], Maximize, 18);
    if (text === '⊞') replaceIcon(span, ['⊞'], Grid2x2, 18);
    if (text === '🖫') replaceIcon(span, ['🖫'], Download, 18);
    // Only replace × on close buttons, never in math/resolutions like 512×512
    if (
      text === '×' &&
      (span.closest('.modal') ||
        span.closest('.close') ||
        span.closest('button') ||
        span.classList.contains('close'))
    ) {
      replaceIcon(span, ['×'], X, 18);
    }
  }

  for (const a of document.querySelectorAll('a')) {
    if (isInExtraNetworkCard(a)) continue;
    const text = a.textContent?.trim();
    if (text === '❮') replaceIcon(a, ['❮'], ArrowLeft, 18);
    if (text === '❯') replaceIcon(a, ['❯'], ArrowRight, 18);
  }
  consola.success('🤯 [svgIcon] replace');
};
