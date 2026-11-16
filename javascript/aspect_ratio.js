/**
 * Lobe Theme Neo - Aspect Ratio & Generation Controls v3.2
 *
 * Features:
 * - Native Lobe Theme Styling: Fully unified with Ant Design / LobeHub UI tokens.
 * - Dual View Modes (Configurable in Experimental Settings & on-panel toggle):
 *   1. "dropdown": Compact header pill [ ⊞ 832 × 1216 (2:3) ▾ ] with floating popover presets.
 *   2. "buttons": Original full grid view with filter tabs [ Все ] [ ▯ Портрет & Квадрат ] [ ▭ Пейзаж ].
 * - Perfectly Sorted Presets:
 *   - Square: 1024×1024 (SDXL/Flux), 768×768 (SD 2.x), 512×512 (SD 1.5).
 *   - Portrait: 4:5 (896×1152), 3:4 (896×1216), 2:3 (832×1216), 9:16 (768×1344), 9:21 (640×1536).
 *   - Landscape: 5:4 (1152×896), 4:3 (1216×896), 3:2 (1216×832), 16:9 (1344×768), 2:1 (1408×704), 21:9 (1536×640).
 * - Floating Popover Presets Menu with Square section on top and high-contrast ratio badges.
 * - Full WebUI Defaults (ui-config.json) 2-Way Sync for Resolution, Batch Count & Batch Size.
 * - Width & Height sliders and number inputs with Swap button (⇅).
 * - Symmetrical 2x2 Sampler & CFG Scale generation layout.
 */

(function () {
    const getAppRoot = () => (typeof gradioApp === "function" ? gradioApp() : null) || document.body;
    // Standard Resolution Presets (divisible by 64 / 8, logically ordered)
    const PRESETS = [
        // Square (Квадрат — базовые стандарты)
        { label: "1:1", w: 1024, h: 1024, group: "square", family: "XL" },
        { label: "1:1", w: 768, h: 768, group: "square", family: "SD2" },
        { label: "1:1", w: 512, h: 512, group: "square", family: "SD15" },

        // Portrait (Портретные — от близких к квадрату до самых узких)
        { label: "4:5", w: 896, h: 1152, group: "portrait", family: "XL" },
        { label: "3:4", w: 896, h: 1216, group: "portrait", family: "XL" },
        { label: "2:3", w: 832, h: 1216, group: "portrait", family: "XL" },
        { label: "2:3", w: 512, h: 768, group: "portrait", family: "SD15" },
        { label: "9:16", w: 768, h: 1344, group: "portrait", family: "XL" },
        { label: "9:16", w: 512, h: 896, group: "portrait", family: "SD15" },
        { label: "9:16", w: 480, h: 832, group: "portrait", family: "Wan" },
        { label: "9:21", w: 640, h: 1536, group: "portrait", family: "XL" },

        // Landscape (Альбомные / Пейзажные — от близких к квадрату до ультрашироких)
        { label: "5:4", w: 1152, h: 896, group: "landscape", family: "XL" },
        { label: "4:3", w: 1216, h: 896, group: "landscape", family: "XL" },
        { label: "3:2", w: 1216, h: 832, group: "landscape", family: "XL" },
        { label: "3:2", w: 768, h: 512, group: "landscape", family: "SD15" },
        { label: "16:9", w: 1344, h: 768, group: "landscape", family: "XL" },
        { label: "16:9", w: 896, h: 512, group: "landscape", family: "SD15" },
        { label: "16:9", w: 832, h: 480, group: "landscape", family: "Wan" },
        { label: "2:1", w: 1408, h: 704, group: "landscape", family: "XL" },
        { label: "21:9", w: 1536, h: 640, group: "landscape", family: "XL" },
    ];

    const I18N = {
        en_US: {
            title: "Resolution",
            samplingTitle: "Sampling",
            presetsEmpty: "Enable a preset family in Theme settings, or enter a custom size.",
            aspectRatio: "Aspect Ratio",
            buttonsView: "Buttons",
            dropdownView: "Dropdown",
            buttonsViewTip: "Switch to full buttons grid view",
            dropdownViewTip: "Switch to compact dropdown popover view",
            filterAll: "All",
            filterSquare: "Square",
            filterPortrait: "Portrait",
            filterLandscape: "Landscape",
            resPreviewTip: "Current Resolution (Width × Height)",
            selectPreset: "Select preset...",
            customRes: "Custom",
            portrait: "Portrait",
            landscape: "Landscape",
            square: "Square",
            width: "Width",
            height: "Height",
            batchCount: "Batch Count",
            batchSize: "Batch Size",
            frames: "Frames",
            saveModeError: "Could not save display mode.",
            swapTip: "Swap width and height (⇅)",
            closeTip: "Close",
            settingsTip: "Settings",
            "1:1": "Square 1:1",
            "4:5": "Photo / Social 4:5",
            "3:4": "Portrait 3:4",
            "2:3": "Classic 35mm 2:3",
            "9:16": "Mobile / Story 9:16",
            "9:21": "Cinematic Tall 9:21",
            "5:4": "Landscape 5:4",
            "4:3": "Display 4:3",
            "3:2": "Classic 35mm 3:2",
            "16:9": "Widescreen 16:9",
            "21:9": "Ultra-wide Cinema 21:9",
            "2:1": "Panorama 2:1",
        },
        zh_CN: {
            frames: "帧数",
            title: "尺寸预设",
            aspectRatio: "宽高比",
            buttonsView: "按钮",
            dropdownView: "列表",
            buttonsViewTip: "切换至按钮网格视图",
            dropdownViewTip: "切换至紧凑下拉列表视图",
            filterAll: "全部",
            filterSquare: "方形",
            filterPortrait: "竖向",
            filterLandscape: "横向",
            resPreviewTip: "当前分辨率 (宽 × 高)",
            selectPreset: "选择预设...",
            customRes: "自定义",
            portrait: "竖向",
            landscape: "横向",
            square: "方形",
            width: "宽度",
            height: "高度",
            batchCount: "生成批次",
            batchSize: "每批数量",
            swapTip: "交换宽度和高度 (⇅)",
            closeTip: "关闭",
            settingsTip: "设置",
            "1:1": "正方形 1:1",
            "4:5": "照片 / 社交 4:5",
            "3:4": "竖版人像 3:4",
            "2:3": "经典摄影 2:3",
            "9:16": "移动端 / 竖屏 9:16",
            "9:21": "修长画幅 9:21",
            "5:4": "横向风景 5:4",
            "4:3": "标准显示 4:3",
            "3:2": "经典摄影 3:2",
            "16:9": "宽屏显示 16:9",
            "21:9": "超宽电影 21:9",
            "2:1": "全景 2:1",
        }
    };

    let activePopoverTab = null;

    let activeTrigger = null;

    function closeAllPopovers(restoreFocus = false) {
        document.querySelectorAll(".sd-ar-popover").forEach((p) => {
            p.style.display = "none";
        });
        document.querySelectorAll(".sd-ar-trigger").forEach((btn) => {
            btn.classList.remove("active");
            btn.setAttribute("aria-expanded", "false");
        });
        document.querySelectorAll(".sd-ar-ratio-badge").forEach((badge) => {
            badge.classList.remove("active");
            badge.setAttribute("aria-expanded", "false");
        });
        activePopoverTab = null;
        if (restoreFocus) activeTrigger?.focus();
        activeTrigger = null;
    }

    function positionPopover(triggerBtn, popover) {
        if (!triggerBtn || !popover) return;
        const rect = triggerBtn.getBoundingClientRect();
        const viewport = window.visualViewport;
        const availableWidth = viewport?.width || window.innerWidth;
        const availableHeight = viewport?.height || window.innerHeight;
        const popoverWidth = Math.min(320, availableWidth - 32);
        const left = Math.max(16, Math.min(rect.left, availableWidth - popoverWidth - 16));
        popover.style.position = "fixed";
        popover.style.width = `${popoverWidth}px`;
        popover.style.maxHeight = `${Math.max(80, availableHeight - 32)}px`;
        const height = Math.min(popover.scrollHeight || 400, availableHeight - 32);
        const below = rect.bottom + 6;
        const top = below + height <= availableHeight - 16 ? below : Math.max(16, rect.top - height - 6);
        popover.style.top = `${Math.round(top)}px`;
        popover.style.left = `${Math.round(left)}px`;
        popover.style.zIndex = "10050";
    }

    function readThemeSetting() {
        if (window.lobeThemeSetting) return window.lobeThemeSetting;
        try {
            const raw = localStorage.getItem("SD-LOBE-SETTING") || localStorage.getItem("SD-KITCHEN-SETTING");
            const setting = raw ? JSON.parse(raw) : {};
            return setting && typeof setting === "object" && !Array.isArray(setting) ? setting : {};
        } catch { return {}; }
    }

    function getLocale() {
        const setting = readThemeSetting();
        if (typeof setting.i18n === "string") return setting.i18n;
        const language = (typeof opts !== "undefined" && opts.localization) || navigator.language || "en";
        if (language.toLowerCase().startsWith("ru")) return "ru_RU";
        if (language.toLowerCase().startsWith("zh")) return "zh_CN";
        return "en_US";
    }

    function t(key) {
        const loc = getLocale();
        const dict = I18N[loc] || I18N["en_US"];
        const fallback = dict[key] || I18N["en_US"][key] || key;
        return window.lobeTranslate?.(`aspectPanel.${key}`, fallback) || fallback;
    }

    // Tabler Icons 3.50.0, MIT (TABLER-LICENSE.txt).
    const ratioIcons = {
        x: "<path d=\"M18 6l-12 12\" /><path d=\"M6 6l12 12\" />",
        layoutGrid: "<path d=\"M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4\" /><path d=\"M14 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4\" /><path d=\"M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4\" /><path d=\"M14 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4\" />",
        chevronDown: "<path d=\"M6 9l6 6l6 -6\" />",
        layoutList: "<path d=\"M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -2\" /><path d=\"M4 16a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -2\" />",
        switchVertical: "<path d=\"M3 8l4 -4l4 4\" /><path d=\"M7 4l0 9\" /><path d=\"M13 16l4 4l4 -4\" /><path d=\"M17 10l0 10\" />",
        circle: "<path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" />",
        square: "<path d=\"M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14\" />",
        rectangleVertical: "<path d=\"M5 5a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -14\" />",
        rectangle: "<path d=\"M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10\" />",
    };
    function ratioIcon(name, size = 12, className = "") {
        return `<svg aria-hidden="true" class="${className}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${ratioIcons[name]}</svg>`;
    }

    function isAspectRatioEnabled() {
        const setting = readThemeSetting();
        if (typeof setting.enableAspectRatio === "boolean") return setting.enableAspectRatio;
        return true;
    }

    function isResolutionFamilyEnabled(family, setting = readThemeSetting()) {
        return setting[`resolutionPresets${family}`] ?? (family === "XL");
    }

    function updatePresetVisibility(panel, popover) {
        const setting = readThemeSetting();
        const filters = [...panel.querySelectorAll(".sd-ar-filter-btn")];
        const grid = [...panel.querySelectorAll(".sd-ar-btn")];
        const available = grid.filter((button) => isResolutionFamilyEnabled(button.dataset.family, setting));
        let active = filters.find((button) => button.classList.contains("active")) || filters[0];
        if (active.dataset.filter !== "all" && !available.some((button) => button.dataset.group === active.dataset.filter)) {
            active = filters[0];
        }
        for (const button of filters) {
            const group = button.dataset.filter;
            const count = group === "all" ? available.length : available.filter((item) => item.dataset.group === group).length;
            button.hidden = group !== "all" && count === 0;
            button.classList.toggle("active", button === active);
            button.setAttribute("aria-pressed", String(button === active));
            button.querySelector(".sd-ar-filter-count").textContent = String(count);
        }
        for (const button of grid) {
            const group = active.dataset.filter;
            button.hidden = !isResolutionFamilyEnabled(button.dataset.family, setting) ||
                (group !== "all" && button.dataset.group !== group);
        }
        for (const group of popover.querySelectorAll(".sd-ar-popover-grid")) {
            const buttons = [...group.querySelectorAll("button[data-family]")];
            buttons.forEach((button) => { button.hidden = !isResolutionFamilyEnabled(button.dataset.family, setting); });
            group.hidden = group.previousElementSibling.hidden = buttons.every((button) => button.hidden);
        }
        panel.querySelector(".sd-ar-presets-empty").hidden = available.length > 0;
        popover.querySelector(".sd-ar-presets-empty").hidden = available.length > 0;
    }

    function getAspectRatioViewMode() {
        const setting = readThemeSetting();
        if (["buttons", "dropdown"].includes(setting.aspectRatioMode)) return setting.aspectRatioMode;
        let legacy;
        try { legacy = localStorage.getItem("lobe_ratio_default_view"); } catch {}
        if (["buttons", "dropdown"].includes(legacy)) return legacy;
        return "dropdown";
    }

    async function setAspectRatioViewMode(mode, panel) {
        if (!["buttons", "dropdown"].includes(mode)) return;
        try {
            if (typeof window.lobeThemeSetSetting === "function") {
                await window.lobeThemeSetSetting({ aspectRatioMode: mode });
            } else {
                const setting = { ...readThemeSetting(), aspectRatioMode: mode };
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 5000);
                try {
                    const response = await fetch('/lobe/config', { method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(setting), signal: controller.signal });
                    if (!response.ok) throw new Error('Settings save failed');
                    localStorage.setItem('SD-LOBE-SETTING', JSON.stringify(setting));
                    window.lobeThemeSetting = setting;
                } finally { clearTimeout(timeout); }
            }
            panel?.querySelector(".sd-ar-save-error")?.remove();
            localStorage.removeItem("lobe_ratio_default_view");
            checkLiveSettings();
        } catch (error) {
            console.warn('[Lobe] Could not save aspect ratio settings', error);
            checkLiveSettings();
            if (panel) {
                let status = panel.querySelector('.sd-ar-save-error');
                if (!status) {
                    status = document.createElement('div');
                    status.className = 'sd-ar-save-error';
                    status.setAttribute('role', 'alert');
                    panel.append(status);
                }
                status.dataset.i18n = "saveModeError";
                updateTranslatedText(status);
            }
        }
    }

    function getSliderBlock(input) {
        if (!input) return null;
        return input.closest("[id^='txt2img_'], [id^='img2img_']") ||
               input.closest(".gradio-slider") ||
               input.parentElement?.closest("div[id]") ||
               input.parentElement?.parentElement?.parentElement ||
               input.parentElement?.parentElement;
    }

    function readNativeVal(nativeInput, fallback) {
        if (!nativeInput) return fallback;
        const block = getSliderBlock(nativeInput);
        const num = block ? (block.querySelector("input[type=number]") || nativeInput) : nativeInput;
        const range = block ? block.querySelector("input[type=range]") : null;

        const nVal = parseInt(num?.value, 10);
        if (!isNaN(nVal) && nVal > 0) return nVal;

        const rVal = parseInt(range?.value, 10);
        if (!isNaN(rVal) && rVal > 0) return rVal;

        const attrVal = parseInt(num?.getAttribute("value"), 10);
        if (!isNaN(attrVal) && attrVal > 0) return attrVal;

        return fallback;
    }

    function setNativeVal(input, val) {
        if (!input) return false;
        const numVal = parseInt(val, 10);
        if (isNaN(numVal)) return false;

        const control = getSliderBlock(input)?.querySelector("input[type=range]") || input;
        if (Number(control.value) === numVal && Number(input.value) === numVal) return false;
        control.value = String(numVal);
        control.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        control.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
        queueMicrotask(() => control.dispatchEvent(new Event("pointerup", { bubbles: true, composed: true })));
        return true;
    }

    function syncBoundsFromNative(nativeInput, customNum, customSlider, fallbackMin, fallbackMax, fallbackStep) {
        if (!nativeInput) return { min: fallbackMin, max: fallbackMax, step: fallbackStep };
        const block = getSliderBlock(nativeInput);
        const rangeInput = block ? block.querySelector("input[type=range]") : null;
        const numberInput = block ? (block.querySelector("input[type=number]") || nativeInput) : nativeInput;

        const bound = (name, fallback) => {
            const value = parseFloat(rangeInput?.[name] || numberInput?.[name]);
            return Number.isFinite(value) ? value : fallback;
        };
        const min = bound("min", fallbackMin);
        const max = bound("max", fallbackMax);
        const step = bound("step", fallbackStep);

        if (customNum) {
            if (parseFloat(customNum.min) !== min) customNum.min = min;
            if (parseFloat(customNum.max) !== max) customNum.max = max;
            if (parseFloat(customNum.step) !== step) customNum.step = step;
        }
        if (customSlider) {
            if (parseFloat(customSlider.min) !== min) customSlider.min = min;
            if (parseFloat(customSlider.max) !== max) customSlider.max = max;
            if (parseFloat(customSlider.step) !== step) customSlider.step = step;
        }

        return { min, max, step };
    }

    function clampToInput(val, input, fallbackMin, fallbackMax, fallbackStep) {
        const min = parseFloat(input?.min) || fallbackMin;
        const max = parseFloat(input?.max) || fallbackMax;
        const step = parseFloat(input?.step) || fallbackStep;
        let num = Math.max(min, Math.min(max, parseInt(val, 10) || min));
        if (step > 1) {
            num = Math.round((num - min) / step) * step + min;
        }
        return Math.max(min, Math.min(max, num));
    }

    function updateSliderTrack(slider) {
        if (!slider) return;
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 100;
        const val = parseFloat(slider.value) || 0;
        const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
        slider.style.setProperty("--lobe-range-progress", `${pct}%`);
    }

    function findMatchingPreset(w, h) {
        return PRESETS.find((p) => p.w === w && p.h === h) || null;
    }

    function calculateApproxRatio(w, h) {
        if (!w || !h) return "1:1";
        const val = w / h;

        const standardRatios = [
            { label: "1:1", val: 1 },
            { label: "4:5", val: 4 / 5 },
            { label: "5:4", val: 5 / 4 },
            { label: "3:4", val: 3 / 4 },
            { label: "4:3", val: 4 / 3 },
            { label: "2:3", val: 2 / 3 },
            { label: "3:2", val: 3 / 2 },
            { label: "9:16", val: 9 / 16 },
            { label: "16:9", val: 16 / 9 },
            { label: "9:21", val: 9 / 21 },
            { label: "21:9", val: 21 / 9 },
            { label: "2:1", val: 2 },
            { label: "1:2", val: 0.5 },
        ];
        for (const r of standardRatios) {
            if (Math.abs(val - r.val) < 0.035) {
                return r.label;
            }
        }

        function gcd(a, b) {
            return b === 0 ? a : gcd(b, a % b);
        }
        const divisor = gcd(Math.round(w), Math.round(h));
        const simW = Math.round(w / divisor);
        const simH = Math.round(h / divisor);
        if (simW <= 32 && simH <= 32) {
            return `${simW}:${simH}`;
        }
        return `${(val).toFixed(2)}:1`;
    }

    function createPopoverElement(tabName) {
        let popover = document.getElementById(`${tabName}_ar_popover`);
        if (popover) return popover;

        popover = document.createElement("div");
        popover.className = "sd-ar-popover";
        popover.id = `${tabName}_ar_popover`;
        popover.style.display = "none";
        popover.setAttribute("role", "dialog");
        popover.setAttribute("aria-label", t("title"));

        const squarePresets = PRESETS.filter((p) => p.group === "square");
        const portraitPresets = PRESETS.filter((p) => p.group === "portrait");
        const landscapePresets = PRESETS.filter((p) => p.group === "landscape");

        popover.innerHTML = `
            <div class="sd-ar-popover-header">
                <span class="sd-ar-popover-title" data-i18n="title">${t("title")}</span>
                <div class="sd-ar-popover-actions">
                    <button type="button" class="sd-ar-popover-iconbtn sd-ar-popover-close" title="${t("closeTip")}">
                        ${ratioIcon("x", 14)}
                    </button>
                </div>
            </div>

            <div class="sd-ar-popover-content">
                <p class="sd-ar-presets-empty" data-i18n="presetsEmpty" hidden>${t("presetsEmpty")}</p>
                <!-- Square Section First (Baseline) -->
                <div class="sd-ar-popover-sectitle" data-i18n="square">${t("square")}</div>
                <div class="sd-ar-popover-grid">
                    ${squarePresets.map((p) => `
                        <button type="button" class="sd-ar-popover-btn" data-family="${p.family}" data-w="${p.w}" data-h="${p.h}" title="${p.w} × ${p.h} (${t(p.label)}) · ${p.family}">
                            <span class="sd-ar-pop-ratio">${p.label}</span>
                            <span class="sd-ar-pop-res">${p.w} × ${p.h}</span>
                        </button>
                    `).join("")}
                </div>

                <!-- Portrait Section (From closest to square to narrowest) -->
                <div class="sd-ar-popover-sectitle" data-i18n="portrait">${t("portrait")}</div>
                <div class="sd-ar-popover-grid">
                    ${portraitPresets.map((p) => `
                        <button type="button" class="sd-ar-popover-btn" data-family="${p.family}" data-w="${p.w}" data-h="${p.h}" title="${p.w} × ${p.h} (${t(p.label)}) · ${p.family}">
                            <span class="sd-ar-pop-ratio">${p.label}</span>
                            <span class="sd-ar-pop-res">${p.w} × ${p.h}</span>
                        </button>
                    `).join("")}
                </div>

                <!-- Landscape Section (From closest to square to ultrawide) -->
                <div class="sd-ar-popover-sectitle" data-i18n="landscape">${t("landscape")}</div>
                <div class="sd-ar-popover-grid">
                    ${landscapePresets.map((p) => `
                        <button type="button" class="sd-ar-popover-btn" data-family="${p.family}" data-w="${p.w}" data-h="${p.h}" title="${p.w} × ${p.h} (${t(p.label)}) · ${p.family}">
                            <span class="sd-ar-pop-ratio">${p.label}</span>
                            <span class="sd-ar-pop-res">${p.w} × ${p.h}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
        `;

        document.body.appendChild(popover);

        const closeBtn = popover.querySelector(".sd-ar-popover-close");
        if (closeBtn) closeBtn.addEventListener("click", () => closeAllPopovers(true));
        popover.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                event.preventDefault();
                closeAllPopovers(true);
            } else if (event.key === "Tab") {
                const buttons = Array.from(popover.querySelectorAll("button:not([disabled], [hidden])"));
                const first = buttons[0], last = buttons[buttons.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        });

        return popover;
    }

    function createAspectRatioPanel(tabName) {
        const panel = document.createElement("div");
        panel.className = "sd-ar-panel-compact";
        panel.id = `${tabName}_ar_panel`;

        const squarePresets = PRESETS.filter((p) => p.group === "square");
        const portraitPresets = PRESETS.filter((p) => p.group === "portrait");
        const landscapePresets = PRESETS.filter((p) => p.group === "landscape");

        panel.innerHTML = `
            <!-- Top Toolbar: Preset Trigger Pill, Mode Toggle, and Swap Button -->
            <div class="sd-ar-card-header">
                <div class="sd-ar-header-left">
                    <strong class="sd-ar-panel-title" data-i18n="title">${t("title")}</strong>
                    <button type="button" class="sd-ar-trigger" id="${tabName}_ar_trigger_btn" title="${t("title")}">
                        ${ratioIcon("layoutGrid", 14, "sd-ar-icon-grid")}
                        <span class="sd-ar-trigger-res" id="${tabName}_ar_trigger_res">1024 × 1024</span>
                        <span class="sd-ar-ratio-badge" id="${tabName}_ar_ratio_btn">1:1</span>
                        ${ratioIcon("chevronDown", 12, "sd-ar-icon-chevron")}
                    </button>
                </div>
                <div class="sd-ar-header-actions">
                    <!-- View Mode Toggle: [ ⊞ Кнопки ] [ ▾ Список ] -->
                    <div class="sd-ar-view-toggle">
                        <button type="button" class="sd-ar-toggle-btn" id="${tabName}_ar_view_buttons" data-view="buttons" title="${t("buttonsViewTip")}">
                            ${ratioIcon("layoutGrid", 13)}
                            <span data-i18n="buttonsView">${t("buttonsView")}</span>
                        </button>
                        <button type="button" class="sd-ar-toggle-btn" id="${tabName}_ar_view_dropdown" data-view="dropdown" title="${t("dropdownViewTip")}">
                            ${ratioIcon("layoutList", 13)}
                            <span data-i18n="dropdownView">${t("dropdownView")}</span>
                        </button>
                    </div>

                    <!-- Orientation Swap Button -->
                    <button type="button" class="sd-ar-icon-action-btn" id="${tabName}_ar_swap_btn" title="${t("swapTip")}">
                        ${ratioIcon("switchVertical", 15)}
                    </button>
                </div>
            </div>

            <!-- Original Buttons Grid View (Activated when mode === "buttons") -->
            <div class="sd-ar-buttons-wrap" id="${tabName}_ar_buttons_wrap" style="display: none;">
                <div class="sd-ar-filter-row">
                    <div class="sd-ar-filter-bar">
                        <button type="button" class="sd-ar-filter-btn active" data-filter="all">
                            ${ratioIcon("circle", 12, "sd-ar-tab-icon")}
                            <span data-i18n="filterAll">${t("filterAll")}</span> <span class="sd-ar-filter-count">${PRESETS.length}</span>
                        </button>
                        <button type="button" class="sd-ar-filter-btn" data-filter="square">
                            ${ratioIcon("square", 12, "sd-ar-tab-icon")}
                            <span data-i18n="filterSquare">${t("filterSquare")}</span> <span class="sd-ar-filter-count">${squarePresets.length}</span>
                        </button>
                        <button type="button" class="sd-ar-filter-btn" data-filter="portrait">
                            ${ratioIcon("rectangleVertical", 12, "sd-ar-tab-icon")}
                            <span data-i18n="filterPortrait">${t("filterPortrait")}</span> <span class="sd-ar-filter-count">${portraitPresets.length}</span>
                        </button>
                        <button type="button" class="sd-ar-filter-btn" data-filter="landscape">
                            ${ratioIcon("rectangle", 12, "sd-ar-tab-icon")}
                            <span data-i18n="filterLandscape">${t("filterLandscape")}</span> <span class="sd-ar-filter-count">${landscapePresets.length}</span>
                        </button>
                    </div>
                </div>
                <p class="sd-ar-presets-empty" data-i18n="presetsEmpty" hidden>${t("presetsEmpty")}</p>
                <div class="sd-ar-grid" id="${tabName}_ar_grid">
                    ${PRESETS.map((p, idx) => `
                        <button type="button" class="sd-ar-btn" data-family="${p.family}" data-w="${p.w}" data-h="${p.h}" data-idx="${idx}" data-group="${p.group}" title="${p.label} (${p.w} × ${p.h}) · ${p.family}">
                            <div class="sd-ar-btn-icon" aria-hidden="true"><span style="--preset-ratio:${p.w} / ${p.h};--preset-icon-width:${Math.min(22, Math.round(20 * p.w / p.h))}px"></span></div>
                            <div class="sd-ar-btn-info">
                                <span class="sd-ar-btn-ratio">${p.label}</span>
                                <span class="sd-ar-btn-res">${p.w} × ${p.h}</span>
                            </div>
                        </button>
                    `).join("")}
                </div>
            </div>

            <!-- Body: Symmetrical 2 Columns -->
            <div class="sd-ar-card-body">
                <!-- Left: Dimensions (Width & Height) -->
                <div class="sd-ar-col">
                    <div class="sd-ar-slider-cell">
                        <div class="sd-ar-slider-label-row">
                            <span class="sd-ar-label-name" data-i18n="width">${t("width")}</span>
                            <input type="number" class="sd-ar-compact-num" id="${tabName}_ar_width_num" min="64" max="2048" step="8" />
                        </div>
                        <input type="range" class="sd-ar-compact-slider" id="${tabName}_ar_width_slider" min="64" max="2048" step="8" />
                    </div>
                    <div class="sd-ar-slider-cell">
                        <div class="sd-ar-slider-label-row">
                            <span class="sd-ar-label-name" data-i18n="height">${t("height")}</span>
                            <input type="number" class="sd-ar-compact-num" id="${tabName}_ar_height_num" min="64" max="2048" step="8" />
                        </div>
                        <input type="range" class="sd-ar-compact-slider" id="${tabName}_ar_height_slider" min="64" max="2048" step="8" />
                    </div>
                </div>

                <!-- Right: Batch (Count & Size) -->
                <div class="sd-ar-col">
                    <div class="sd-ar-slider-cell">
                        <div class="sd-ar-slider-label-row">
                            <span class="sd-ar-label-name" data-i18n="batchCount">${t("batchCount")}</span>
                            <input type="number" class="sd-ar-compact-num" id="${tabName}_ar_bcount_num" min="1" max="128" step="1" />
                        </div>
                        <input type="range" class="sd-ar-compact-slider" id="${tabName}_ar_bcount_slider" min="1" max="128" step="1" />
                    </div>
                    <div class="sd-ar-slider-cell">
                        <div class="sd-ar-slider-label-row">
                            <span class="sd-ar-label-name" data-i18n="batchSize">${t("batchSize")}</span>
                            <input type="number" class="sd-ar-compact-num" id="${tabName}_ar_bsize_num" min="1" max="8" step="1" />
                        </div>
                        <input type="range" class="sd-ar-compact-slider" id="${tabName}_ar_bsize_slider" min="1" max="8" step="1" />
                    </div>
                </div>
            </div>
        `;
        return panel;
    }

    function updateTranslatedText(element) {
        const value = t(element.dataset.i18n);
        if (element.textContent !== value) element.textContent = value;
        if (element.classList.contains("sd-ar-label-name")) {
            element.closest(".sd-ar-slider-cell").querySelectorAll("input").forEach((input) => {
                if (input.getAttribute("aria-label") !== value) input.setAttribute("aria-label", value);
            });
        }
    }

    function updateAllTexts() {
        document.querySelectorAll(".sd-ar-panel-compact [data-i18n], .sd-ar-popover [data-i18n], .sd-ar-sampling-title")
            .forEach(updateTranslatedText);

        document.querySelectorAll(".sd-ar-icon-action-btn").forEach((btn) => {
            btn.title = t("swapTip");
        });
        document.querySelectorAll(".sd-ar-trigger").forEach((btn) => {
            btn.title = t("title");
        });
        document.querySelectorAll(".sd-ar-popover-close").forEach((btn) => {
            btn.title = t("closeTip");
        });
        document.querySelectorAll(".sd-ar-popover-btn").forEach((btn) => {
            const preset = PRESETS.find(({ w, h }) => w === Number(btn.dataset.w) && h === Number(btn.dataset.h));
            if (preset) btn.title = `${preset.w} × ${preset.h} (${t(preset.label)}) · ${preset.family}`;
        });
    }

    // Gradio stores component visibility on the block itself. offsetParent
    // forces layout and also mistakes an inactive tab for a disabled control.
    function isDistilledEnabled(element) {
        return Boolean(element && !element.hidden &&
            !element.classList.contains('hidden') && !element.classList.contains('hide') &&
            element.style.display !== 'none');
    }

    function organizeGenerationParams(tabName) {
        const root = getAppRoot();
        if (!root) return;

        const isEnabled = readThemeSetting().enhanceSampling ?? true;
        const samplerContainer = root.querySelector(`#sampler_selection_${tabName}`);
        const formTarget = samplerContainer ? (samplerContainer.querySelector(".form") || samplerContainer) : null;
        const steps = root.querySelector(`#${tabName}_steps`);
        const cfgScale = root.querySelector(`#${tabName}_cfg_scale`);
        const distilledCfg = root.querySelector(`#${tabName}_distilled_cfg_scale`);

        if (!samplerContainer) return;

        if (isEnabled) {
            if (!samplerContainer.querySelector(":scope > .sd-ar-sampling-title")) {
                const title = document.createElement("div");
                title.className = "sd-ar-sampling-title";
                title.dataset.i18n = "samplingTitle";
                title.textContent = t("samplingTitle");
                samplerContainer.prepend(title);
            }
            samplerContainer.classList.add("sd-ar-enhanced-sampler");
            if (formTarget) formTarget.classList.add("sd-ar-enhanced-form");

            // Ensure steps is inside formTarget so all 4 elements are direct children of the grid
            if (steps && formTarget && !formTarget.contains(steps)) {
                if (!steps._origParent) steps._origParent = steps.parentElement;
                if (!steps._origNextSibling) steps._origNextSibling = steps.nextSibling;
                formTarget.appendChild(steps);
            }

            if (cfgScale && formTarget && !formTarget.contains(cfgScale)) {
                if (!cfgScale._origParent) {
                    cfgScale._origParent = cfgScale.parentElement;
                    cfgScale._origNextSibling = cfgScale.nextSibling;
                }
                formTarget.appendChild(cfgScale);
            }

            const isDistilledVisible = isDistilledEnabled(distilledCfg);

            if (isDistilledVisible) {
                if (formTarget && !formTarget.contains(distilledCfg)) {
                    if (!distilledCfg._origParent) distilledCfg._origParent = distilledCfg.parentElement;
                    formTarget.appendChild(distilledCfg);
                }
                samplerContainer.classList.add("has-distilled-cfg");
            } else {
                if (distilledCfg && distilledCfg._origParent && formTarget && formTarget.contains(distilledCfg)) {
                    distilledCfg._origParent.appendChild(distilledCfg);
                }
                samplerContainer.classList.remove("has-distilled-cfg");
            }

            for (const control of [steps, cfgScale, distilledCfg]) {
                control?._origParent?.classList.add("sd-ar-sampling-source");
            }
        } else {
            samplerContainer.querySelector(":scope > .sd-ar-sampling-title")?.remove();
            samplerContainer.classList.remove("sd-ar-enhanced-sampler");
            if (formTarget) formTarget.classList.remove("sd-ar-enhanced-form");
            samplerContainer.classList.remove("has-distilled-cfg");

            for (const control of [distilledCfg, cfgScale, steps]) {
                const originalParent = control?._origParent;
                if (!originalParent) continue;
                originalParent.classList.remove("sd-ar-sampling-source");
                if (formTarget?.contains(control)) {
                    const next = control._origNextSibling;
                    originalParent.insertBefore(control, next?.parentNode === originalParent ? next : null);
                }
            }
        }
    }

    function initTabControls(tabName) {
        const root = getAppRoot();
        if (!root) return false;

        if (root.querySelector(`#${tabName}_ar_panel`)) {
            organizeGenerationParams(tabName);
            return true;
        }

        const nativeWidthInput = root.querySelector(`#${tabName}_width input[type=number]`) || root.querySelector(`#${tabName}_width input`);
        const nativeHeightInput = root.querySelector(`#${tabName}_height input[type=number]`) || root.querySelector(`#${tabName}_height input`);
        const nativeBatchCountInput = root.querySelector(`#${tabName}_batch_count input[type=number]`) || root.querySelector(`#${tabName}_batch_count input`);
        const nativeBatchSizeInput = root.querySelector(`#${tabName}_batch_size input[type=number]`) || root.querySelector(`#${tabName}_batch_size input`);

        if (!nativeWidthInput || !nativeHeightInput) return false;

        let origDimensionsRow = null;
        if (tabName === "txt2img") {
            const colSize = root.querySelector("#txt2img_column_size");
            origDimensionsRow = colSize ? (colSize.closest(".form") || colSize.closest(".gradio-row") || colSize.parentElement) : null;
        } else if (tabName === "img2img") {
            const colSize = root.querySelector("#img2img_tab_resize_to #img2img_column_size") || root.querySelector("#img2img_column_size");
            origDimensionsRow = colSize ? (colSize.closest(".form") || colSize.closest(".gradio-row") || colSize.parentElement) : null;
        }

        if (!origDimensionsRow) return false;
        origDimensionsRow.classList.add("sd-ar-orig-dimensions-row");

        const panel = createAspectRatioPanel(tabName);
        const settings = root.querySelector(`#${tabName}_settings`);
        let anchor = origDimensionsRow;
        while (tabName === "txt2img" && anchor.parentElement && anchor.parentElement !== settings && settings?.contains(anchor.parentElement)) {
            anchor = anchor.parentElement;
        }
        anchor.before(panel);

        const popover = createPopoverElement(tabName);
        organizeGenerationParams(tabName);

        const isEnabled = isAspectRatioEnabled();
        if (isEnabled) {
            root.classList.add("sd-ar-hide-original");
            origDimensionsRow.style.setProperty("display", "none", "important");
            panel.style.display = "flex";
        } else {
            root.classList.remove("sd-ar-hide-original");
            origDimensionsRow.style.display = "";
            panel.style.display = "none";
        }

        const widthNum = panel.querySelector(`#${tabName}_ar_width_num`);
        const heightNum = panel.querySelector(`#${tabName}_ar_height_num`);
        const widthSlider = panel.querySelector(`#${tabName}_ar_width_slider`);
        const heightSlider = panel.querySelector(`#${tabName}_ar_height_slider`);
        const swapBtn = panel.querySelector(`#${tabName}_ar_swap_btn`);
        const triggerBtn = panel.querySelector(`#${tabName}_ar_trigger_btn`);
        const ratioBtn = panel.querySelector(`#${tabName}_ar_ratio_btn`);

        const bcountNum = panel.querySelector(`#${tabName}_ar_bcount_num`);
        const bcountSlider = panel.querySelector(`#${tabName}_ar_bcount_slider`);
        const bsizeNum = panel.querySelector(`#${tabName}_ar_bsize_num`);
        const bsizeSlider = panel.querySelector(`#${tabName}_ar_bsize_slider`);

        const popoverBtns = popover.querySelectorAll(".sd-ar-popover-btn");
        const gridBtns = panel.querySelectorAll(".sd-ar-btn");
        const filterBtns = panel.querySelectorAll(".sd-ar-filter-btn");
        const batchSizeCaption = panel.querySelector('[data-i18n="batchSize"]');
        panel.querySelectorAll(".sd-ar-label-name").forEach(updateTranslatedText);

        const viewButtonsBtn = panel.querySelector(`#${tabName}_ar_view_buttons`);
        const viewDropdownBtn = panel.querySelector(`#${tabName}_ar_view_dropdown`);
        const buttonsWrap = panel.querySelector(`#${tabName}_ar_buttons_wrap`);

        // Apply View Mode (Buttons vs Dropdown)
        function applyViewMode(mode) {
            if (mode === "buttons") {
                if (buttonsWrap) {
                    buttonsWrap.classList.remove("sd-ar-hidden");
                    buttonsWrap.style.setProperty("display", "flex", "important");
                }
                if (viewButtonsBtn) viewButtonsBtn.classList.add("active");
                if (viewDropdownBtn) viewDropdownBtn.classList.remove("active");
                closeAllPopovers();
            } else {
                if (buttonsWrap) {
                    buttonsWrap.classList.add("sd-ar-hidden");
                    buttonsWrap.style.setProperty("display", "none", "important");
                }
                if (viewButtonsBtn) viewButtonsBtn.classList.remove("active");
                if (viewDropdownBtn) viewDropdownBtn.classList.add("active");
            }
        }

        const initialMode = getAspectRatioViewMode();
        applyViewMode(initialMode);

        if (viewButtonsBtn) {
            viewButtonsBtn.addEventListener("click", () => {
                setAspectRatioViewMode("buttons", panel);
            });
        }
        if (viewDropdownBtn) {
            viewDropdownBtn.addEventListener("click", () => {
                setAspectRatioViewMode("dropdown", panel);
            });
        }

        updatePresetVisibility(panel, popover);
        filterBtns.forEach((button) => {
            button.addEventListener("click", () => {
                filterBtns.forEach((item) => item.classList.toggle("active", item === button));
                updatePresetVisibility(panel, popover);
            });
        });

        // Inherit dynamic bounds directly from WebUI native elements / ui-config.json
        function syncAllBounds() {
            syncBoundsFromNative(nativeWidthInput, widthNum, widthSlider, 64, 2048, 8);
            syncBoundsFromNative(nativeHeightInput, heightNum, heightSlider, 64, 2048, 8);
            syncBoundsFromNative(nativeBatchCountInput, bcountNum, bcountSlider, 1, 128, 1);
            syncBoundsFromNative(nativeBatchSizeInput, bsizeNum, bsizeSlider, 1, 8, 1);
        }
        syncAllBounds();

        const togglePopover = (e) => {
            e.stopPropagation();
            if (popover.style.display === "block" && activePopoverTab === tabName) {
                closeAllPopovers();
            } else {
                closeAllPopovers();
                activePopoverTab = tabName;
                activeTrigger = e.currentTarget;
                popover.style.display = "block";
                triggerBtn.classList.add("active");
                triggerBtn.setAttribute("aria-expanded", "true");
                if (ratioBtn) ratioBtn.setAttribute("aria-expanded", "true");
                if (ratioBtn) ratioBtn.classList.add("active");
                positionPopover(triggerBtn, popover);
                (popover.querySelector(".sd-ar-popover-btn.active:not([hidden])") || popover.querySelector(".sd-ar-popover-btn:not([hidden])") || popover.querySelector(".sd-ar-popover-close"))?.focus();
            }
        };

        if (triggerBtn) {
            triggerBtn.setAttribute("aria-haspopup", "dialog");
            triggerBtn.setAttribute("aria-expanded", "false");
            triggerBtn.setAttribute("aria-controls", popover.id);
            triggerBtn.addEventListener("click", togglePopover);
        }
        if (ratioBtn) {
            ratioBtn.setAttribute("aria-haspopup", "dialog");
            ratioBtn.setAttribute("aria-expanded", "false");
            ratioBtn.setAttribute("aria-controls", popover.id);
            ratioBtn.addEventListener("click", togglePopover);
        }

        function applyResolution(w, h) {
            setNativeVal(nativeWidthInput, w);
            setNativeVal(nativeHeightInput, h);
            updateDimensionsUI(w, h);
        }

        popoverBtns.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                if (e && !e.isTrusted) return;
                const w = parseInt(btn.getAttribute("data-w"), 10);
                const h = parseInt(btn.getAttribute("data-h"), 10);
                applyResolution(w, h);
                closeAllPopovers(true);
            });
        });

        gridBtns.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                if (e && !e.isTrusted) return;
                const w = parseInt(btn.getAttribute("data-w"), 10);
                const h = parseInt(btn.getAttribute("data-h"), 10);
                applyResolution(w, h);
            });
        });

        function updateDimensionsUI(w, h) {
            let numW = parseInt(w, 10);
            let numH = parseInt(h, 10);

            if (isNaN(numW) || numW <= 0) {
                numW = parseInt(nativeWidthInput.value, 10) || parseInt(nativeWidthInput.getAttribute("value"), 10) || 1024;
            }
            if (isNaN(numH) || numH <= 0) {
                numH = parseInt(nativeHeightInput.value, 10) || parseInt(nativeHeightInput.getAttribute("value"), 10) || 1024;
            }

            if (parseInt(widthSlider.value, 10) !== numW) widthSlider.value = numW;
            if (parseInt(widthNum.value, 10) !== numW) widthNum.value = numW;
            if (parseInt(heightSlider.value, 10) !== numH) heightSlider.value = numH;
            if (parseInt(heightNum.value, 10) !== numH) heightNum.value = numH;

            updateSliderTrack(widthSlider);
            updateSliderTrack(heightSlider);

            const matched = findMatchingPreset(numW, numH);
            const ratioLabel = matched ? matched.label : calculateApproxRatio(numW, numH);
            if (ratioBtn) {
                ratioBtn.textContent = ratioLabel;
            }
            const triggerRes = panel.querySelector(`#${tabName}_ar_trigger_res`);
            if (triggerRes) {
                triggerRes.textContent = `${numW} × ${numH}`;
            }

            // Announce selected presets to assistive technology.
            [...popoverBtns, ...gridBtns].forEach((btn) => {
                const active = parseInt(btn.dataset.w, 10) === numW && parseInt(btn.dataset.h, 10) === numH;
                btn.classList.toggle("active", active);
                btn.setAttribute("aria-pressed", String(active));
            });
        }

        function updateBatchCountUI(val) {
            const clamped = clampToInput(val, bcountSlider, 1, 128, 1);
            if (parseInt(bcountSlider.value, 10) !== clamped) bcountSlider.value = clamped;
            if (parseInt(bcountNum.value, 10) !== clamped) bcountNum.value = clamped;
            updateSliderTrack(bcountSlider);
        }

        function updateBatchSizeUI(val) {
            const clamped = clampToInput(val, bsizeSlider, 1, 8, 1);
            if (parseInt(bsizeSlider.value, 10) !== clamped) bsizeSlider.value = clamped;
            if (parseInt(bsizeNum.value, 10) !== val) bsizeNum.value = val;
            updateSliderTrack(bsizeSlider);
        }

        widthSlider.addEventListener("input", (e) => {
            if (!e.isTrusted) return;
            const w = parseInt(e.target.value, 10);
            const h = parseInt(heightSlider.value, 10);
            setNativeVal(nativeWidthInput, w);
            updateDimensionsUI(w, h);
        });

        widthNum.addEventListener("input", (e) => {
            if (!e.isTrusted) return;
            let w = parseInt(e.target.value, 10);
            if (!isNaN(w)) {
                w = clampToInput(w, widthSlider, 64, 2048, 8);
                const h = parseInt(heightSlider.value, 10);
                setNativeVal(nativeWidthInput, w);
                updateDimensionsUI(w, h);
            }
        });

        widthNum.addEventListener("change", (e) => {
            if (!e.isTrusted) return;
            let w = clampToInput(e.target.value, widthSlider, 64, 2048, 8);
            const h = parseInt(heightSlider.value, 10);
            setNativeVal(nativeWidthInput, w);
            updateDimensionsUI(w, h);
        });

        heightSlider.addEventListener("input", (e) => {
            if (!e.isTrusted) return;
            const h = parseInt(e.target.value, 10);
            const w = parseInt(widthSlider.value, 10);
            setNativeVal(nativeHeightInput, h);
            updateDimensionsUI(w, h);
        });

        heightNum.addEventListener("input", (e) => {
            if (!e.isTrusted) return;
            let h = parseInt(e.target.value, 10);
            if (!isNaN(h)) {
                h = clampToInput(h, heightSlider, 64, 2048, 8);
                const w = parseInt(widthSlider.value, 10);
                setNativeVal(nativeHeightInput, h);
                updateDimensionsUI(w, h);
            }
        });

        heightNum.addEventListener("change", (e) => {
            if (!e.isTrusted) return;
            let h = clampToInput(e.target.value, heightSlider, 64, 2048, 8);
            const w = parseInt(widthSlider.value, 10);
            setNativeVal(nativeHeightInput, h);
            updateDimensionsUI(w, h);
        });

        swapBtn.addEventListener("click", (e) => {
            if (e && !e.isTrusted) return;
            const currentW = parseInt(widthSlider.value, 10);
            const currentH = parseInt(heightSlider.value, 10);
            setNativeVal(nativeWidthInput, currentH);
            setNativeVal(nativeHeightInput, currentW);
            updateDimensionsUI(currentH, currentW);

            // Auto-switch filter in buttons view if active preset is hidden
            const activeBtn = panel.querySelector(".sd-ar-btn.active");
            if (activeBtn && (activeBtn.classList.contains("sd-ar-hidden") || activeBtn.style.display === "none")) {
                const activeGroup = activeBtn.getAttribute("data-group");
                const targetFilterBtn = panel.querySelector(`.sd-ar-filter-btn[data-filter="${activeGroup}"]`) || panel.querySelector('.sd-ar-filter-btn[data-filter="all"]');
                if (targetFilterBtn) targetFilterBtn.click();
            }
        });

        function setBatchCount(val) {
            const count = clampToInput(val, bcountSlider, 1, 128, 1);
            if (nativeBatchCountInput) setNativeVal(nativeBatchCountInput, count);
            updateBatchCountUI(count);
        }

        bcountSlider.addEventListener("input", (e) => { if (e.isTrusted) setBatchCount(e.target.value); });
        bcountNum.addEventListener("input", (e) => { if (e.isTrusted) setBatchCount(e.target.value); });
        bcountNum.addEventListener("change", (e) => { if (e.isTrusted) setBatchCount(e.target.value); });

        function setBatchSize(val) {
            const size = clampToInput(val, bsizeSlider, 1, 8, 1);
            if (nativeBatchSizeInput) setNativeVal(nativeBatchSizeInput, size);
            updateBatchSizeUI(size);
        }

        bsizeSlider.addEventListener("input", (e) => { if (e.isTrusted) setBatchSize(e.target.value); });
        bsizeNum.addEventListener("input", (e) => { if (e.isTrusted) setBatchSize(e.target.value); });
        bsizeNum.addEventListener("change", (e) => { if (e.isTrusted) setBatchSize(e.target.value); });

        // Initial State Sync from Gradio / WebUI Defaults
        const initW = readNativeVal(nativeWidthInput, 1024);
        const initH = readNativeVal(nativeHeightInput, 1024);
        updateDimensionsUI(initW, initH);
        if (nativeBatchCountInput) updateBatchCountUI(readNativeVal(nativeBatchCountInput, 1));
        if (nativeBatchSizeInput) updateBatchSizeUI(readNativeVal(nativeBatchSizeInput, 1));

        const syncFromNative = () => {
            if (!panel.isConnected) return;
            syncAllBounds();
            const nativeLabel = getSliderBlock(nativeBatchSizeInput)?.querySelector(".head label");
            const nativeCaption = nativeLabel?.textContent.trim();
            const localizedFrames = window.localization?.Frames;
            const videoFrames = Number(bsizeSlider.step) > 1 || nativeCaption === "Frames" ||
                (typeof localizedFrames === "string" && nativeCaption === localizedFrames);
            const captionKey = videoFrames ? "frames" : "batchSize";
            if (batchSizeCaption.dataset.i18n !== captionKey) {
                batchSizeCaption.dataset.i18n = captionKey;
                updateTranslatedText(batchSizeCaption);
            }
            const w = readNativeVal(nativeWidthInput, null);
            const h = readNativeVal(nativeHeightInput, null);
            if (w && h && (w !== parseInt(widthNum.value, 10) || h !== parseInt(heightNum.value, 10) ||
                w !== parseInt(widthSlider.value, 10) || h !== parseInt(heightSlider.value, 10))) {
                updateDimensionsUI(w, h);
            }
            if (nativeBatchCountInput) {
                const bc = readNativeVal(nativeBatchCountInput, null);
                if (bc) updateBatchCountUI(bc);
            }
            if (nativeBatchSizeInput) {
                const bs = readNativeVal(nativeBatchSizeInput, null);
                if (bs) updateBatchSizeUI(bs);
            }
        };

        const attachListeners = (input) => {
            if (!input) return;
            input.addEventListener("input", syncFromNative);
            input.addEventListener("change", syncFromNative);
            const block = getSliderBlock(input);
            const range = block ? block.querySelector("input[type=range]") : null;
            if (range && range !== input) {
                range.addEventListener("input", syncFromNative);
                range.addEventListener("change", syncFromNative);
            }
        };

        const nativeChanges = new MutationObserver(syncFromNative);
        for (const input of [nativeWidthInput, nativeHeightInput, nativeBatchCountInput, nativeBatchSizeInput]) {
            const block = input && getSliderBlock(input);
            if (block) nativeChanges.observe(block, {
                attributes: true, attributeFilter: ["value", "style", "min", "max", "step"],
                childList: true, characterData: true, subtree: true,
            });
        }
        syncFromNative();

        attachListeners(nativeWidthInput);
        attachListeners(nativeHeightInput);
        attachListeners(nativeBatchCountInput);
        attachListeners(nativeBatchSizeInput);


        if (typeof onAfterUiUpdate === "function") {
            onAfterUiUpdate(syncFromNative);
        }
        return true;
    }

    /**
     * Live on/off toggling of the Aspect Ratio controls without reload
     */
    let lastEnabledState = null;
    let lastViewModeState = null;

    // Global document listeners for popover dismissal
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".sd-ar-popover") && !e.target.closest(".sd-ar-trigger")) {
            closeAllPopovers();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeAllPopovers();
        }
    });

    window.addEventListener("resize", () => {
        if (activePopoverTab) {
            const trigger = document.querySelector(`#${activePopoverTab}_ar_trigger_btn`);
            const popover = document.querySelector(`#${activePopoverTab}_ar_popover`);
            if (trigger && popover && popover.style.display === "block") {
                positionPopover(trigger, popover);
            }
        }
    });

    window.addEventListener("scroll", () => {
        if (activePopoverTab) {
            const trigger = document.querySelector(`#${activePopoverTab}_ar_trigger_btn`);
            const popover = document.querySelector(`#${activePopoverTab}_ar_popover`);
            if (trigger && popover && popover.style.display === "block") {
                positionPopover(trigger, popover);
            }
        }
    }, true);

    function applyEnabledState(enabled) {
        if (lastEnabledState === enabled) return;
        lastEnabledState = enabled;

        const root = getAppRoot();
        if (!root) return;

        ["txt2img", "img2img"].forEach((tab) => {
            const panel = root.querySelector(`#${tab}_ar_panel`);
            if (panel) {
                panel.style.display = enabled ? "flex" : "none";
            }
            const origRow = root.querySelector(`#${tab}_settings .sd-ar-orig-dimensions-row`) ||
                            root.querySelector(`#${tab}_column_size`)?.closest(".form") ||
                            root.querySelector(`#${tab}_column_size`)?.closest(".gradio-row") ||
                            root.querySelector(`#${tab}_column_size`)?.parentElement;
            if (origRow) {
                if (enabled) {
                    origRow.style.setProperty("display", "none", "important");
                } else {
                    origRow.style.display = "";
                }
            }
        });

        if (enabled) {
            root.classList.add("sd-ar-hide-original");
        } else {
            root.classList.remove("sd-ar-hide-original");
        }
    }

    let lastDistilledState = { txt2img: null, img2img: null };
    function checkDynamicLayoutState() {
        const root = getAppRoot();
        if (!root) return;
        ["txt2img", "img2img"].forEach((tab) => {
            const distilledCfg = root.querySelector(`#${tab}_distilled_cfg_scale`);
            const isVis = isDistilledEnabled(distilledCfg);
            if (lastDistilledState[tab] !== isVis) {
                lastDistilledState[tab] = isVis;
                organizeGenerationParams(tab);
            }
        });
    }

    function attachPresetListener() {
        const root = getAppRoot();
        if (!root) return;
        const presetEl = root.querySelector("#forge_ui_preset input") || root.querySelector("#forge_ui_preset select") || root.querySelector("#forge_ui_preset");
        if (presetEl && !presetEl._hasLobeListener) {
            presetEl._hasLobeListener = true;
            const onPreset = () => {
                setTimeout(checkDynamicLayoutState, 150);
                setTimeout(checkDynamicLayoutState, 500);
            };
            presetEl.addEventListener("change", onPreset);
            presetEl.addEventListener("input", onPreset);
        }
    }

    function checkLiveSettings() {
        applyEnabledState(isAspectRatioEnabled());
        const root = getAppRoot();
        for (const tab of ["txt2img", "img2img"]) {
            organizeGenerationParams(tab);
            const panel = root.querySelector(`#${tab}_ar_panel`);
            const popover = document.getElementById(`${tab}_ar_popover`);
            if (panel && popover) updatePresetVisibility(panel, popover);
        }
        checkDynamicLayoutState();
        attachPresetListener();
        const currentMode = getAspectRatioViewMode();
        if (lastViewModeState !== currentMode) {
            lastViewModeState = currentMode;
            ["txt2img", "img2img"].forEach((tab) => {
                const bwrap = document.querySelector(`#${tab}_ar_buttons_wrap`);
                const vbtn = document.querySelector(`#${tab}_ar_view_buttons`);
                const vdbtn = document.querySelector(`#${tab}_ar_view_dropdown`);
                if (bwrap) {
                    if (currentMode === "buttons") {
                        bwrap.classList.remove("sd-ar-hidden");
                        bwrap.style.setProperty("display", "flex", "important");
                    } else {
                        bwrap.classList.add("sd-ar-hidden");
                        bwrap.style.setProperty("display", "none", "important");
                    }
                }
                if (vbtn) {
                    if (currentMode === "buttons") vbtn.classList.add("active");
                    else vbtn.classList.remove("active");
                }
                if (vdbtn) {
                    if (currentMode === "dropdown") vdbtn.classList.add("active");
                    else vdbtn.classList.remove("active");
                }
            });
        }
        document.querySelectorAll('.sd-ar-view-toggle .sd-ar-view-btn, [id$="_ar_view_buttons"], [id$="_ar_view_dropdown"]').forEach((btn) => {
            btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
        });
        updateAllTexts();
    }

    window.addEventListener("lobe:settings", checkLiveSettings);
    window.addEventListener("lobe:language", updateAllTexts);
    const watchedDistilled = new WeakSet();
    const distilledObserver = new MutationObserver(checkDynamicLayoutState);
    function watchDistilledVisibility() {
        const root = getAppRoot();
        for (const tab of ['txt2img', 'img2img']) {
            const block = root?.querySelector(`#${tab}_distilled_cfg_scale`);
            if (block && !watchedDistilled.has(block)) {
                watchedDistilled.add(block);
                distilledObserver.observe(block, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
            }
        }
    }

    window.addEventListener("storage", (e) => {
        if (e.key === "SD-LOBE-SETTING" || e.key === "SD-KITCHEN-SETTING") {
            if (e.key === "SD-LOBE-SETTING" && e.newValue) {
                try { window.lobeThemeSetting = JSON.parse(e.newValue); } catch {}
            }
            checkLiveSettings();
        }
    });

    if (typeof onOptionsChanged === "function") {
        onOptionsChanged(checkLiveSettings);
    }

    let initialized = false;
    function initAll() {
        const txtOk = initTabControls("txt2img");
        const imgOk = initTabControls("img2img");
        watchDistilledVisibility();
        checkLiveSettings();
        if (txtOk && imgOk) {
            initialized = true;
        }
    }

    if (typeof onUiLoaded === "function") {
        onUiLoaded(initAll);
    }
    document.addEventListener("DOMContentLoaded", initAll);

    let attempts = 0;
    const interval = setInterval(() => {
        initAll();
        if (initialized || ++attempts >= 60) {
            clearInterval(interval);

        }
    }, 500);
})();
