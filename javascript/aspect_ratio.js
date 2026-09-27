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
    // Standard Resolution Presets (divisible by 64 / 8, logically ordered)
    const PRESETS = [
        // Square (Квадрат — базовые стандарты)
        { label: "1:1", w: 1024, h: 1024, group: "square", desc: "SDXL / Flux 1024×1024" },
        { label: "1:1", w: 768, h: 768, group: "square", desc: "SD 2.x 768×768" },
        { label: "1:1", w: 512, h: 512, group: "square", desc: "SD 1.5 512×512" },

        // Portrait (Портретные — от близких к квадрату до самых узких)
        { label: "4:5", w: 896, h: 1152, group: "portrait", desc: "Фото / Инста 4:5" },
        { label: "3:4", w: 896, h: 1216, group: "portrait", desc: "Портрет 3:4" },
        { label: "2:3", w: 832, h: 1216, group: "portrait", desc: "Классический 35мм 2:3" },
        { label: "9:16", w: 768, h: 1344, group: "portrait", desc: "Мобильный / Stories 9:16" },
        { label: "9:21", w: 640, h: 1536, group: "portrait", desc: "Вытянутый кино 9:21" },

        // Landscape (Альбомные / Пейзажные — от близких к квадрату до ультрашироких)
        { label: "5:4", w: 1152, h: 896, group: "landscape", desc: "Пейзаж 5:4" },
        { label: "4:3", w: 1216, h: 896, group: "landscape", desc: "Монитор 4:3" },
        { label: "3:2", w: 1216, h: 832, group: "landscape", desc: "Классический 35мм 3:2" },
        { label: "16:9", w: 1344, h: 768, group: "landscape", desc: "Широкоформатный 16:9" },
        { label: "2:1", w: 1408, h: 704, group: "landscape", desc: "Панорама 2:1" },
        { label: "21:9", w: 1536, h: 640, group: "landscape", desc: "Кинематографичный 21:9" },
    ];

    const I18N = {
        en_US: {
            title: "Dimension Presets",
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
        ru_RU: {
            title: "Предустановки размера",
            aspectRatio: "Соотношение сторон",
            buttonsView: "Кнопки",
            dropdownView: "Список",
            buttonsViewTip: "Переключить на сетку кнопок",
            dropdownViewTip: "Переключить на компактный выпадающий список",
            filterAll: "Все",
            filterSquare: "Квадрат",
            filterPortrait: "Портрет",
            filterLandscape: "Пейзаж",
            resPreviewTip: "Текущее разрешение (Ширина × Высота)",
            selectPreset: "Выбрать пресет...",
            customRes: "Пользовательское",
            portrait: "Портрет",
            landscape: "Альбомный",
            square: "Квадрат",
            width: "Ширина",
            height: "Высота",
            batchCount: "Количество пакетов",
            batchSize: "Размер пакета",
            swapTip: "Поменять местами ширину и высоту (⇅)",
            closeTip: "Закрыть",
            settingsTip: "Настройки",
            "1:1": "Квадрат 1:1",
            "4:5": "Фото / Инста 4:5",
            "3:4": "Портрет 3:4",
            "2:3": "Классический 2:3",
            "9:16": "Мобильный / Stories 9:16",
            "9:21": "Вытянутый 9:21",
            "5:4": "Пейзаж 5:4",
            "4:3": "Монитор 4:3",
            "3:2": "Классический 3:2",
            "16:9": "Широкоформатный 16:9",
            "21:9": "Кинематографичный 21:9",
            "2:1": "Панорама 2:1",
        },
        zh_CN: {
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

    function closeAllPopovers() {
        document.querySelectorAll(".sd-ar-popover").forEach((p) => {
            p.style.display = "none";
        });
        document.querySelectorAll(".sd-ar-trigger").forEach((btn) => {
            btn.classList.remove("active");
        });
        document.querySelectorAll(".sd-ar-ratio-badge").forEach((badge) => {
            badge.classList.remove("active");
        });
        activePopoverTab = null;
    }

    function positionPopover(triggerBtn, popover) {
        if (!triggerBtn || !popover) return;
        const rect = triggerBtn.getBoundingClientRect();
        const popoverWidth = 320;
        let left = rect.left;
        let top = rect.bottom + 6;

        if (left + popoverWidth > window.innerWidth - 16) {
            left = window.innerWidth - popoverWidth - 16;
        }
        if (left < 16) left = 16;

        popover.style.position = "fixed";
        popover.style.top = `${Math.round(top)}px`;
        popover.style.left = `${Math.round(left)}px`;
        popover.style.width = `${popoverWidth}px`;
        popover.style.zIndex = "99999";
    }

    function getLocale() {
        if (typeof opts !== "undefined" && opts.localization) {
            const loc = opts.localization.toLowerCase();
            if (loc.startsWith("ru")) return "ru_RU";
            if (loc.startsWith("zh")) return "zh_CN";
            if (loc.startsWith("en")) return "en_US";
        }

        try {
            const raw = localStorage.getItem("SD-LOBE-SETTING") || localStorage.getItem("SD-KITCHEN-SETTING");
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.i18n) {
                    if (parsed.i18n.startsWith("ru")) return "ru_RU";
                    if (parsed.i18n.startsWith("zh")) return "zh_CN";
                    if (parsed.i18n.startsWith("en")) return "en_US";
                    return parsed.i18n;
                }
            }
        } catch (e) {}

        const nav = (navigator.language || navigator.userLanguage || "").toLowerCase();
        if (nav.startsWith("ru")) return "ru_RU";
        if (nav.startsWith("zh")) return "zh_CN";
        return "en_US";
    }

    function t(key) {
        const loc = getLocale();
        const dict = I18N[loc] || I18N["en_US"];
        return dict[key] || I18N["en_US"][key] || key;
    }

    function renderRatioSvg(group) {
        if (group === "square") {
            return `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="2.5" width="11" height="11" rx="1.5"></rect></svg>`;
        } else if (group === "portrait") {
            return `<svg viewBox="0 0 16 16" width="10" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="1.5" width="9" height="13" rx="1.5"></rect></svg>`;
        } else {
            return `<svg viewBox="0 0 16 16" width="14" height="10" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5"></rect></svg>`;
        }
    }

    function isAspectRatioEnabled() {
        if (typeof opts !== "undefined") {
            if (typeof opts.lobe_enable_aspect_ratio !== "undefined") {
                return Boolean(opts.lobe_enable_aspect_ratio);
            }
            if (typeof opts.enable_aspect_ratio !== "undefined") {
                return Boolean(opts.enable_aspect_ratio);
            }
        }

        try {
            const raw = localStorage.getItem("SD-LOBE-SETTING") || localStorage.getItem("SD-KITCHEN-SETTING");
            if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed.enableAspectRatio !== "undefined") {
                    return Boolean(parsed.enableAspectRatio);
                }
            }
        } catch (e) {}

        const localFlag = localStorage.getItem("lobe_enable_aspect_ratio");
        if (localFlag !== null) {
            return localFlag === "true";
        }

        return true;
    }

    function getAspectRatioViewMode() {
        const local = localStorage.getItem("lobe_ratio_default_view");
        if (local === "buttons" || local === "dropdown") return local;

        try {
            const raw = localStorage.getItem("SD-LOBE-SETTING") || localStorage.getItem("SD-KITCHEN-SETTING");
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.aspectRatioMode) return parsed.aspectRatioMode;
                if (parsed.aspectRatioViewMode) return parsed.aspectRatioViewMode;
            }
        } catch (e) {}

        if (typeof opts !== "undefined") {
            if (typeof opts.lobe_ratio_default_view !== "undefined") return opts.lobe_ratio_default_view;
            if (typeof opts.gal_ratio_default_view !== "undefined") return opts.gal_ratio_default_view;
        }

        return "dropdown";
    }

    function setAspectRatioViewMode(mode) {
        localStorage.setItem("lobe_ratio_default_view", mode);
        try {
            const raw = localStorage.getItem("SD-LOBE-SETTING") || localStorage.getItem("SD-KITCHEN-SETTING") || "{}";
            const parsed = JSON.parse(raw) || {};
            parsed.aspectRatioMode = mode;
            parsed.aspectRatioViewMode = mode;
            const updated = JSON.stringify(parsed);
            localStorage.setItem("SD-LOBE-SETTING", updated);
            localStorage.setItem("SD-KITCHEN-SETTING", updated);
        } catch (e) {}
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

        const block = getSliderBlock(input);
        const numberInput = block ? (block.querySelector("input[type=number]") || input) : input;
        const rangeInput = block ? block.querySelector("input[type=range]") : null;

        let changed = false;
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;

        // 1. Update number input
        if (numberInput && parseInt(numberInput.value, 10) !== numVal) {
            if (nativeSetter) {
                nativeSetter.call(numberInput, numVal);
            } else {
                numberInput.value = numVal;
            }

            if (typeof updateInput === "function") {
                updateInput(numberInput);
            }
            numberInput.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
            numberInput.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
            numberInput.dispatchEvent(new Event("blur", { bubbles: true, composed: true }));
            try {
                numberInput.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, composed: true }));
            } catch (e) {
                numberInput.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, composed: true }));
            }
            changed = true;
        }

        // 2. Update range slider input (triggers Gradio reactive store & preview overlays)
        if (rangeInput && parseInt(rangeInput.value, 10) !== numVal) {
            if (nativeSetter) {
                nativeSetter.call(rangeInput, numVal);
            } else {
                rangeInput.value = numVal;
            }

            if (typeof updateInput === "function") {
                updateInput(rangeInput);
            }
            rangeInput.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
            rangeInput.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
            try {
                rangeInput.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, composed: true }));
            } catch (e) {
                rangeInput.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, composed: true }));
            }
            changed = true;
        }

        return changed;
    }

    function syncBoundsFromNative(nativeInput, customNum, customSlider, fallbackMin, fallbackMax, fallbackStep) {
        if (!nativeInput) return { min: fallbackMin, max: fallbackMax, step: fallbackStep };
        const block = getSliderBlock(nativeInput);
        const rangeInput = block ? block.querySelector("input[type=range]") : null;
        const numberInput = block ? (block.querySelector("input[type=number]") || nativeInput) : nativeInput;

        const min = parseFloat(numberInput?.min || rangeInput?.min) || fallbackMin;
        const max = parseFloat(numberInput?.max || rangeInput?.max) || fallbackMax;
        const step = parseFloat(numberInput?.step || rangeInput?.step) || fallbackStep;

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
        slider.style.background = `linear-gradient(to right, var(--color-accent, var(--colorPrimary, #52c41a)) 0%, var(--color-accent, var(--colorPrimary, #52c41a)) ${pct}%, var(--neutral-700, var(--colorFillTertiary, #333333)) ${pct}%, var(--neutral-700, var(--colorFillTertiary, #333333)) 100%)`;
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

        const squarePresets = PRESETS.filter((p) => p.group === "square");
        const portraitPresets = PRESETS.filter((p) => p.group === "portrait");
        const landscapePresets = PRESETS.filter((p) => p.group === "landscape");

        popover.innerHTML = `
            <div class="sd-ar-popover-header">
                <span class="sd-ar-popover-title" data-i18n="title">${t("title")}</span>
                <div class="sd-ar-popover-actions">
                    <button type="button" class="sd-ar-popover-iconbtn sd-ar-popover-close" title="${t("closeTip")}">
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="sd-ar-popover-content">
                <!-- Square Section First (Baseline) -->
                <div class="sd-ar-popover-sectitle" data-i18n="square">${t("square")}</div>
                <div class="sd-ar-popover-grid">
                    ${squarePresets.map((p) => `
                        <button type="button" class="sd-ar-popover-btn" data-w="${p.w}" data-h="${p.h}" title="${p.w} × ${p.h} (${t(p.label)}) — ${p.desc}">
                            <span class="sd-ar-pop-ratio">${p.label}</span>
                            <span class="sd-ar-pop-res">${p.w} × ${p.h}</span>
                        </button>
                    `).join("")}
                </div>

                <!-- Portrait Section (From closest to square to narrowest) -->
                <div class="sd-ar-popover-sectitle" data-i18n="portrait">${t("portrait")}</div>
                <div class="sd-ar-popover-grid">
                    ${portraitPresets.map((p) => `
                        <button type="button" class="sd-ar-popover-btn" data-w="${p.w}" data-h="${p.h}" title="${p.w} × ${p.h} (${t(p.label)}) — ${p.desc}">
                            <span class="sd-ar-pop-ratio">${p.label}</span>
                            <span class="sd-ar-pop-res">${p.w} × ${p.h}</span>
                        </button>
                    `).join("")}
                </div>

                <!-- Landscape Section (From closest to square to ultrawide) -->
                <div class="sd-ar-popover-sectitle" data-i18n="landscape">${t("landscape")}</div>
                <div class="sd-ar-popover-grid">
                    ${landscapePresets.map((p) => `
                        <button type="button" class="sd-ar-popover-btn" data-w="${p.w}" data-h="${p.h}" title="${p.w} × ${p.h} (${t(p.label)}) — ${p.desc}">
                            <span class="sd-ar-pop-ratio">${p.label}</span>
                            <span class="sd-ar-pop-res">${p.w} × ${p.h}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
        `;

        document.body.appendChild(popover);

        const closeBtn = popover.querySelector(".sd-ar-popover-close");
        if (closeBtn) closeBtn.addEventListener("click", closeAllPopovers);

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
                    <button type="button" class="sd-ar-trigger" id="${tabName}_ar_trigger_btn" title="${t("title")}">
                        <svg class="sd-ar-icon-grid" viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
                            <rect x="2" y="2" width="5" height="5" rx="1"></rect>
                            <rect x="9" y="2" width="5" height="5" rx="1"></rect>
                            <rect x="2" y="9" width="5" height="5" rx="1"></rect>
                            <rect x="9" y="9" width="5" height="5" rx="1"></rect>
                        </svg>
                        <span class="sd-ar-trigger-res" id="${tabName}_ar_trigger_res">1024 × 1024</span>
                        <span class="sd-ar-ratio-badge" id="${tabName}_ar_ratio_btn">1:1</span>
                        <svg class="sd-ar-icon-chevron" viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
                            <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="sd-ar-header-actions">
                    <!-- View Mode Toggle: [ ⊞ Кнопки ] [ ▾ Список ] -->
                    <div class="sd-ar-view-toggle">
                        <button type="button" class="sd-ar-toggle-btn" id="${tabName}_ar_view_buttons" data-view="buttons" title="${t("buttonsViewTip")}">
                            <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
                                <rect x="2" y="2" width="5" height="5" rx="1"></rect>
                                <rect x="9" y="2" width="5" height="5" rx="1"></rect>
                                <rect x="2" y="9" width="5" height="5" rx="1"></rect>
                                <rect x="9" y="9" width="5" height="5" rx="1"></rect>
                            </svg>
                            <span data-i18n="buttonsView">${t("buttonsView")}</span>
                        </button>
                        <button type="button" class="sd-ar-toggle-btn" id="${tabName}_ar_view_dropdown" data-view="dropdown" title="${t("dropdownViewTip")}">
                            <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" rx="0.5"></rect>
                                <rect x="2" y="7" width="12" height="2" rx="0.5"></rect>
                                <rect x="2" y="11" width="12" height="2" rx="0.5"></rect>
                            </svg>
                            <span data-i18n="dropdownView">${t("dropdownView")}</span>
                        </button>
                    </div>

                    <!-- Orientation Swap Button -->
                    <button type="button" class="sd-ar-icon-action-btn" id="${tabName}_ar_swap_btn" title="${t("swapTip")}">
                        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
                            <path d="M4.5 2a.5.5 0 0 1 .5.5v9.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L4 12.293V2.5a.5.5 0 0 1 .5-.5zm7 12a.5.5 0 0 1-.5-.5V3.707l-2.146 2.147a.5.5 0 0 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L12 3.707V13.5a.5.5 0 0 1-.5.5z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Original Buttons Grid View (Activated when mode === "buttons") -->
            <div class="sd-ar-buttons-wrap" id="${tabName}_ar_buttons_wrap" style="display: none;">
                <div class="sd-ar-filter-row">
                    <div class="sd-ar-filter-bar">
                        <button type="button" class="sd-ar-filter-btn active" data-filter="all">
                            <span data-i18n="filterAll">${t("filterAll")}</span> (${PRESETS.length})
                        </button>
                        <button type="button" class="sd-ar-filter-btn" data-filter="square">
                            ▢ <span data-i18n="filterSquare">${t("filterSquare")}</span> (${squarePresets.length})
                        </button>
                        <button type="button" class="sd-ar-filter-btn" data-filter="portrait">
                            ▯ <span data-i18n="filterPortrait">${t("filterPortrait")}</span> (${portraitPresets.length})
                        </button>
                        <button type="button" class="sd-ar-filter-btn" data-filter="landscape">
                            ▭ <span data-i18n="filterLandscape">${t("filterLandscape")}</span> (${landscapePresets.length})
                        </button>
                    </div>
                </div>
                <div class="sd-ar-grid" id="${tabName}_ar_grid">
                    ${PRESETS.map((p, idx) => `
                        <button type="button" class="sd-ar-btn" data-w="${p.w}" data-h="${p.h}" data-idx="${idx}" data-group="${p.group}" title="${p.label} (${p.w}×${p.h}) — ${p.desc}">
                            <div class="sd-ar-btn-icon">${renderRatioSvg(p.group)}</div>
                            <div class="sd-ar-btn-info">
                                <span class="sd-ar-btn-ratio">${p.label}</span>
                                <span class="sd-ar-btn-res">${p.w}x${p.h}</span>
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

    function updateAllTexts() {
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            if (key) {
                el.textContent = t(key);
            }
        });

        document.querySelectorAll(".sd-ar-icon-action-btn").forEach((btn) => {
            btn.title = t("swapTip");
        });
        document.querySelectorAll(".sd-ar-trigger").forEach((btn) => {
            btn.title = t("title");
        });
        document.querySelectorAll(".sd-ar-popover-close").forEach((btn) => {
            btn.title = t("closeTip");
        });
    }

    function organizeGenerationParams(tabName) {
        const root = gradioApp();
        if (!root) return;

        const isEnabled = isAspectRatioEnabled();
        const samplerContainer = root.querySelector(`#sampler_selection_${tabName}`);
        const formTarget = samplerContainer ? (samplerContainer.querySelector(".form") || samplerContainer) : null;
        const cfgScale = root.querySelector(`#${tabName}_cfg_scale`);
        const distilledCfg = root.querySelector(`#${tabName}_distilled_cfg_scale`);

        if (!samplerContainer) return;

        if (isEnabled) {
            samplerContainer.classList.add("sd-ar-enhanced-sampler");
            if (formTarget) formTarget.classList.add("sd-ar-enhanced-form");

            if (cfgScale && formTarget && !formTarget.contains(cfgScale)) {
                if (!cfgScale._origParent) cfgScale._origParent = cfgScale.parentElement;
                formTarget.appendChild(cfgScale);
            }

            const isDistilledVisible = Boolean(
                distilledCfg &&
                distilledCfg.offsetParent !== null &&
                !distilledCfg.style.display?.includes("none") &&
                !distilledCfg.classList.contains("hide")
            );

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

            const cfgWrapper = (cfgScale && cfgScale._origParent) || root.querySelector(`#${tabName}_settings > div:has(#${tabName}_cfg_scale)`);
            if (cfgWrapper && cfgWrapper !== samplerContainer && cfgWrapper !== formTarget) {
                cfgWrapper.classList.add("sd-ar-orig-cfg-container");
                cfgWrapper.style.setProperty("display", "none", "important");
                if (cfgWrapper.parentElement && cfgWrapper.parentElement.children.length === 1) {
                    cfgWrapper.parentElement.style.setProperty("display", "none", "important");
                }
            }
        } else {
            samplerContainer.classList.remove("sd-ar-enhanced-sampler");
            if (formTarget) formTarget.classList.remove("sd-ar-enhanced-form");
            samplerContainer.classList.remove("has-distilled-cfg");

            if (cfgScale && cfgScale._origParent && formTarget && formTarget.contains(cfgScale)) {
                cfgScale._origParent.appendChild(cfgScale);
                cfgScale._origParent.style.display = "";
            }
            if (distilledCfg && distilledCfg._origParent && formTarget && formTarget.contains(distilledCfg)) {
                distilledCfg._origParent.appendChild(distilledCfg);
                distilledCfg._origParent.style.display = "";
            }
        }
    }

    function initTabControls(tabName) {
        const root = gradioApp();
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
        const samplerContainer = root.querySelector(`#sampler_selection_${tabName}`);
        if (samplerContainer && samplerContainer.parentElement) {
            samplerContainer.parentElement.insertBefore(panel, samplerContainer.nextSibling);
        } else {
            origDimensionsRow.parentElement.insertBefore(panel, origDimensionsRow);
        }
        
        const popover = createPopoverElement(tabName);
        organizeGenerationParams(tabName);

        const isEnabled = isAspectRatioEnabled();
        if (isEnabled) {
            root.classList.add("sd-ar-hide-original");
            origDimensionsRow.style.setProperty("display", "none", "important");
            if (origDimensionsRow.parentElement && origDimensionsRow.parentElement.children.length === 1) {
                origDimensionsRow.parentElement.style.setProperty("display", "none", "important");
            }
            panel.style.display = "flex";
        } else {
            root.classList.remove("sd-ar-hide-original");
            origDimensionsRow.style.display = "";
            if (origDimensionsRow.parentElement) origDimensionsRow.parentElement.style.display = "";
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
                setAspectRatioViewMode("buttons");
                applyViewMode("buttons");
            });
        }
        if (viewDropdownBtn) {
            viewDropdownBtn.addEventListener("click", () => {
                setAspectRatioViewMode("dropdown");
                applyViewMode("dropdown");
            });
        }

        // Filter tabs in buttons mode
        filterBtns.forEach((fbtn) => {
            fbtn.addEventListener("click", () => {
                filterBtns.forEach((b) => b.classList.remove("active"));
                fbtn.classList.add("active");
                const filter = fbtn.getAttribute("data-filter");

                gridBtns.forEach((btn) => {
                    const group = btn.getAttribute("data-group");
                    let show = false;
                    if (filter === "all") {
                        show = true;
                    } else if (filter === "square") {
                        show = (group === "square");
                    } else if (filter === "portrait") {
                        show = (group === "portrait");
                    } else if (filter === "landscape") {
                        show = (group === "landscape");
                    }

                    if (show) {
                        btn.classList.remove("sd-ar-hidden");
                        btn.style.setProperty("display", "flex", "important");
                    } else {
                        btn.classList.add("sd-ar-hidden");
                        btn.style.setProperty("display", "none", "important");
                    }
                });
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
                popover.style.display = "block";
                triggerBtn.classList.add("active");
                if (ratioBtn) ratioBtn.classList.add("active");
                positionPopover(triggerBtn, popover);
            }
        };

        if (triggerBtn) {
            triggerBtn.addEventListener("click", togglePopover);
        }
        if (ratioBtn) {
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
                closeAllPopovers();
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

            // Sync active state across both Popover buttons and Grid buttons
            popoverBtns.forEach((btn) => {
                const bw = parseInt(btn.getAttribute("data-w"), 10);
                const bh = parseInt(btn.getAttribute("data-h"), 10);
                if (bw === numW && bh === numH) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });

            gridBtns.forEach((btn) => {
                const bw = parseInt(btn.getAttribute("data-w"), 10);
                const bh = parseInt(btn.getAttribute("data-h"), 10);
                if (bw === numW && bh === numH) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
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
            if (parseInt(bsizeNum.value, 10) !== clamped) bsizeNum.value = clamped;
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
            syncAllBounds();
            const w = readNativeVal(nativeWidthInput, null);
            const h = readNativeVal(nativeHeightInput, null);
            if (w && h && (w !== parseInt(widthSlider.value, 10) || h !== parseInt(heightSlider.value, 10))) {
                updateDimensionsUI(w, h);
            }
            if (nativeBatchCountInput) {
                const bc = readNativeVal(nativeBatchCountInput, null);
                if (bc && bc !== parseInt(bcountNum.value, 10)) {
                    updateBatchCountUI(bc);
                }
            }
            if (nativeBatchSizeInput) {
                const bs = readNativeVal(nativeBatchSizeInput, null);
                if (bs && bs !== parseInt(bsizeNum.value, 10)) {
                    updateBatchSizeUI(bs);
                }
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

        attachListeners(nativeWidthInput);
        attachListeners(nativeHeightInput);
        attachListeners(nativeBatchCountInput);
        attachListeners(nativeBatchSizeInput);

        setInterval(syncFromNative, 500);
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

        const root = gradioApp();
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
            organizeGenerationParams(tab);
        });

        if (enabled) {
            root.classList.add("sd-ar-hide-original");
        } else {
            root.classList.remove("sd-ar-hide-original");
        }
    }

    function checkLiveSettings() {
        applyEnabledState(isAspectRatioEnabled());
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
        updateAllTexts();
    }

    // Intercept localStorage.setItem in the same window so changes apply instantly
    const originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
        originalSetItem(key, value);
        if (key === "SD-LOBE-SETTING" || key === "SD-KITCHEN-SETTING" || key === "lobe_enable_aspect_ratio" || key === "lobe_ratio_default_view") {
            try {
                checkLiveSettings();
            } catch (e) {}
        }
    };

    window.addEventListener("storage", (e) => {
        if (e.key === "SD-LOBE-SETTING" || e.key === "SD-KITCHEN-SETTING" || e.key === "lobe_enable_aspect_ratio" || e.key === "lobe_ratio_default_view") {
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
        checkLiveSettings();
        if (txtOk && imgOk) {
            initialized = true;
        }
    }

    if (typeof onUiLoaded === "function") {
        onUiLoaded(initAll);
    }
    document.addEventListener("DOMContentLoaded", initAll);

    const interval = setInterval(() => {
        initAll();
        if (initialized) {
            clearInterval(interval);
            setInterval(checkLiveSettings, 400);
        }
    }, 500);
})();
