export interface DropdownAnchor {
  bottom: number;
  left: number;
  top: number;
  width: number;
}

/** Keep native Gradio menus anchored to their field and inside the viewport. */
export const dropdownPlacement = (anchor: DropdownAnchor, width: number, height: number) => {
  const margin = 8;
  const gap = 4;
  const menuWidth = Math.min(anchor.width, Math.max(0, width - margin * 2));
  const below = Math.max(0, height - anchor.bottom - gap - margin);
  const above = Math.max(0, anchor.top - gap - margin);
  const opensAbove = below < Math.min(220, above);
  return {
    bottom: opensAbove ? Math.max(margin, height - anchor.top + gap) : undefined,
    left: Math.max(margin, Math.min(anchor.left, width - menuWidth - margin)),
    maxHeight: Math.min(320, opensAbove ? above : below),
    top: opensAbove ? undefined : Math.max(margin, anchor.bottom + gap),
    width: menuWidth,
  };
};
