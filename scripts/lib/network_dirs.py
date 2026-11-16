"""Build Extra Networks folder filters from indexed models, without walking every file."""
import html
import os


def model_directories(page, *, hidden=False, leading_separator=False):
    directories = set()
    roots = [(root, os.path.normcase(root)) for root in (os.path.abspath(r) for r in page.allowed_directories_for_previews())]
    unique_dirs = set()
    for item in page.items.values():
        filename = item.get("filename")
        if filename:
            unique_dirs.add(os.path.dirname(filename))
    for raw_folder in unique_dirs:
        folder = os.path.abspath(raw_folder)
        for root, norm_root in roots:
            try:
                if os.path.normcase(os.path.commonpath([root, folder])) != norm_root:
                    continue
            except ValueError:  # Windows paths can be on different drives.
                continue
            relative = os.path.relpath(folder, root)
            if relative == ".":
                continue
            parts = relative.split(os.path.sep)
            if not hidden and any(part.startswith(".") for part in parts):
                continue
            for depth in range(1, len(parts) + 1):
                path = os.path.sep.join(parts[:depth]) + os.path.sep
                directories.add((os.path.sep if leading_separator else "") + path)
    return directories


def install_model_directory_filters():
    from modules import shared, ui_extra_networks

    page_class = ui_extra_networks.ExtraNetworksPage
    if getattr(page_class.create_dirs_view_html, "_lobe_model_directories", False):
        return

    def create_dirs_view_html(page, tabname):
        # Initial empty pages no longer traverse the entire LoRA drive twice.
        if not page.items:
            return ""
        paths = model_directories(
            page,
            hidden=shared.opts.extra_networks_show_hidden_directories,
            leading_separator=shared.opts.extra_networks_dir_button_function,
        )
        paths = ["", *sorted(paths, key=shared.natural_sort_key)]
        tab = html.escape(str(tabname), quote=True)
        name = html.escape(str(page.extra_networks_tabname), quote=True)
        return "".join(
            f'<button class="lg secondary gradio-button custom-button{" search-all" if not path else ""}" '
            f'onclick="extraNetworksSearchButton(&quot;{tab}&quot;, &quot;{name}&quot;, event)">'
            f'{html.escape(path or "all")}</button>' for path in paths
        )

    create_dirs_view_html._lobe_model_directories = True
    page_class.create_dirs_view_html = create_dirs_view_html
