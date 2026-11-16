import { setInputValue } from '@/scripts/webui';
import { ChevronRight, svgIcon } from '@/icons/native';

type FolderLabels = { all: string; folder: string; openFolder?: string; toggleFolder?: string };

interface Folder {
  children: Map<string, Folder>;
  name: string;
  path?: string;
}

export function mountNetworkFolders(
  container: HTMLElement,
  labels: FolderLabels,
) {
  const originals = document.createDocumentFragment();
  const buttons = new Map<string, HTMLButtonElement>();
  const roots = new Map<string, Folder>();
  for (const button of container.querySelectorAll<HTMLButtonElement>(':scope > button')) {
    const path = button.classList.contains('search-all') ? '' : button.textContent?.trim() || '';
    buttons.set(path, button);
    originals.append(button);
    let siblings = roots;
    let folder: Folder | undefined;
    const separator = path.includes('\\') ? '\\' : '/';
    let prefix = path.startsWith(separator) ? separator : '';
    for (const name of path.split(/[\\/]+/u).filter(Boolean)) {
      prefix += name + separator;
      folder = siblings.get(name);
      if (!folder) {
        folder = { children: new Map(), name, path: prefix };
        siblings.set(name, folder);
      }
      siblings = folder.children;
    }
    if (folder) folder.path = path;
  }

  const controls = document.createElement('div');
  controls.className = 'lobe-network-folders';
  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = labels.folder;
  search.setAttribute('aria-label', labels.folder);
  const list = document.createElement('div');
  list.className = 'lobe-network-folder-tree';
  const expanded = new Set<Folder>();
  const paneSearch = container.closest('.extra-network-pane')
    ?.querySelector<HTMLInputElement>('.extra-network-control--search-text') ?? null;
  let selected = '';

  const folderButton = (label: string, path: string) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.title = path;
    if (path) button.setAttribute('aria-label', `${labels.openFolder ?? 'Show folder contents'}: ${path}`);
    if (path === selected) button.setAttribute('aria-current', 'true');
    button.onclick = () => {
      const native = buttons.get(path);
      if (native) native.click();
      else setInputValue(paneSearch, path);
      selected = path;
      controls.querySelector('[aria-current]')?.removeAttribute('aria-current');
      list.querySelector('[aria-current]')?.removeAttribute('aria-current');
      button.setAttribute('aria-current', 'true');
    };
    return button;
  };

  const renderBranch = (branches: Map<string, Folder>, parent: HTMLElement) => {
    for (const folder of branches.values()) {
      if (!folder.children.size && folder.path) {
        const button = folderButton(folder.name, folder.path);
        button.className = 'lobe-network-folder-leaf';
        parent.append(button);
        continue;
      }
      const row = document.createElement('div');
      row.className = 'lobe-network-folder-row';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'lobe-network-folder-toggle';
      toggle.innerHTML = svgIcon(ChevronRight, 14);
      toggle.setAttribute('aria-label', `${labels.toggleFolder ?? 'Toggle subfolders'}: ${folder.name}`);
      const children = document.createElement('div');
      children.className = 'lobe-network-folder-children';
      children.hidden = !expanded.has(folder);
      toggle.setAttribute('aria-expanded', String(!children.hidden));
      if (!children.hidden) renderBranch(folder.children, children);
      toggle.onclick = () => {
        children.hidden = !children.hidden;
        toggle.setAttribute('aria-expanded', String(!children.hidden));
        if (children.hidden) expanded.delete(folder);
        else {
          expanded.add(folder);
          if (!children.firstChild) renderBranch(folder.children, children);
        }
      };
      if (folder.path) {
        row.append(toggle, folderButton(folder.name, folder.path));
      } else {
        toggle.append(folder.name);
        toggle.className = '';
        row.append(toggle);
      }
      parent.append(row, children);
    }
  };

  const render = () => {
    const term = search.value.trim().toLowerCase();
    list.replaceChildren();
    if (term) {
      for (const path of buttons.keys()) {
        if (path && path.toLowerCase().includes(term)) list.append(folderButton(path, path));
      }
    } else renderBranch(roots, list);
  };
  const all = folderButton(labels.all, '');
  all.addEventListener('click', () => {
    if (!search.value) return;
    search.value = '';
    render();
  });
  search.oninput = render;
  search.onchange = () => {
    const path = search.value.trim();
    if (!path || path === selected || !buttons.has(path)) return;
    buttons.get(path)?.click();
    selected = path;
    all.removeAttribute('aria-current');
    list.querySelector('[aria-current]')?.removeAttribute('aria-current');
    [...list.querySelectorAll<HTMLButtonElement>('button[title]')]
      .find((button) => button.title === path)?.setAttribute('aria-current', 'true');
  };
  controls.append(all, search);
  container.append(controls, list);
  render();
  return () => {
    controls.remove();
    list.remove();
    container.append(originals);
  };
}

/** Keep Forge's tree and its open branches while separating filter and disclosure. */
export function mountNativeNetworkFolders(tree: HTMLElement, labels: FolderLabels) {
  const search = tree.closest('.extra-network-pane')
    ?.querySelector<HTMLInputElement>('.extra-network-control--search-text') ?? null;
  if (!search) return () => {};
  const restore: (() => void)[] = [];
  const rows = [...tree.querySelectorAll<HTMLElement>('.tree-list-content-dir[data-path]')];
  const select = (row: HTMLElement) => {
    for (const candidate of rows) candidate.toggleAttribute('data-selected', candidate === row);
    setInputValue(search, row.dataset.path ?? '');
  };
  for (const row of rows) {
    const leading = row.querySelector<HTMLElement>('.tree-list-item-action--leading');
    const name = row.querySelector<HTMLElement>('.tree-list-item-label');
    const children = row.nextElementSibling;
    if (!leading || !name || !children) continue;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = leading.className;
    toggle.innerHTML = svgIcon(ChevronRight, 14);
    toggle.setAttribute('aria-label', `${labels.toggleFolder ?? 'Toggle subfolders'}: ${name.textContent}`);
    toggle.setAttribute('aria-expanded', String(!children.hasAttribute('hidden')));
    toggle.onclick = (event) => {
      event.stopPropagation();
      const opening = children.hasAttribute('hidden');
      children.toggleAttribute('hidden', !opening);
      row.toggleAttribute('data-expanded', opening);
      toggle.setAttribute('aria-expanded', String(opening));
    };
    const button = document.createElement('button');
    button.type = 'button';
    button.className = name.className;
    button.textContent = name.textContent;
    button.setAttribute('aria-label', `${labels.openFolder ?? 'Show folder contents'}: ${row.dataset.path}`);
    button.onclick = (event) => {
      event.stopPropagation();
      select(row);
    };
    const onBlankClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || event.target.closest('button')) return;
      event.stopImmediatePropagation();
      select(row);
    };
    row.addEventListener('click', onBlankClick, true);
    leading.replaceWith(toggle);
    name.replaceWith(button);
    restore.push(() => {
      row.removeEventListener('click', onBlankClick, true);
      toggle.replaceWith(leading);
      button.replaceWith(name);
    });
  }
  return () => restore.forEach((undo) => undo());
}

export function mountNetworkLocation(controls: HTMLElement, allFolders: string) {
  const search = controls.querySelector<HTMLInputElement>('.extra-network-control--search-text');
  if (!search) return () => {};
  const location = document.createElement('output');
  location.className = 'lobe-network-location';
  const folderPaths = new Set(
    Array.from(controls.closest('.extra-network-pane')?.querySelectorAll<HTMLElement>(
      '.tree-list-content-dir[data-path]',
    ) ?? [], (entry) => entry.dataset.path),
  );
  const update = () => {
    const value = search.value.trim();
    const folder = value && (/[\\/]$/u.test(value) || folderPaths.has(value));
    location.textContent = folder ? value : allFolders;
    location.title = location.textContent;
  };
  search.addEventListener('input', update);
  controls.append(location);
  update();
  return () => {
    search.removeEventListener('input', update);
    location.remove();
  };
}
