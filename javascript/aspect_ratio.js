/**
 * Lobe Theme Neo - Aspect Ratio & Generation Controls v3.0
 * 
 * Features:
 * - Native Lobe Theme Styling: Fully unified with Ant Design / LobeHub UI tokens.
 * - Floating Popover Presets Menu (matches media_1789598318907.png exactly):
 *   - Sleek Ant Design Select Trigger: [ ⊞ 832 × 1216 (2:3) ▾ ]
 *   - Floating Popover Card with Portrait, Landscape, and Square 2-column grids.
 *   - Active preset highlighted with solid theme accent color and high contrast text.
 *   - Close button (✕), outside click, and Escape key dismissal.
 * - Grid View (Buttons mode) & Popover View (Dropdown mode) toggle.
 * - Trilingual Localization: English (en_US), Russian (ru_RU), and Chinese (zh_CN).
 *   - Dynamic locale detection and live text updates upon setting change.
 * - Width & Height sliders and number inputs with Up/Down Swap button (⇅).
 * - Batch Count & Batch Size sliders and number inputs.
 * - Seamless 2x2 Generation Layout:
 *   Row 1: [ Sampling Method ] [ Schedule Type ] (50% / 50%)
 *   Row 2: [ Sampling Steps  ] [ CFG Scale     ] (50% / 50%)
 * - Live On/Off switching in Theme Settings without page reload.
 */

(function () {
    // Official Stability AI SDXL Training Bucket Resolutions (divisible by 64, ~1MP)
    const PRESETS = [
        // Square
        { label: "1:1", w: 1024, h: 1024, group: "square" },

        // Portrait
        { label: "4:5", w: 896, h: 1152, group: "portrait" },
        { label: "3:4", w: 896, h: 1216, group: "portrait" },
        { label: "2:3", w: 832, h: 1216, group: "portrait" },
        { label: "9:16", w: 768, h: 1344, group: "portrait" },
        { label: "9:21", w: 640, h: 1536, group: "portrait" },

        // Landscape
        { label: "5:4", w: 1152, h: 896, group: "landscape" },
        { label: "4:3", w: 1216, h: 896, group: "landscape" },
        { label: "3:2", w: 1216, h: 832, group: "landscape" },
        { label: "16:9", w: 1344, h: 768, group: "landscape" },
        { label: "21:9", w: 1536, h: 640, group: "landscape" },
        { label: "2:1", w: 1408, h: 704, group: "landscape" },
    ];

    const I18N = {
        en_US: {
            title: "Dimension Presets",
            aspectRatio: "Aspect Ratio",
            buttonsView: "Buttons",
            dropdownView: "List",
            buttonsViewTip: "Buttons view",
            dropdownViewTip: "Dropdown presets view",
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
            buttonsViewTip: "Режим кнопок",
            dropdownViewTip: "Режим выпадающего списка",
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
            buttonsViewTip: "网格视图",
            dropdownViewTip: "下拉预设视图",
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
            "2:1": "全景画幅 2:1",
        },
    };

    function getLocale() {
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

    function setNativeVal(input, val) {
        if (!input) return false;
        const numVal = parseInt(val, 10);
        if (isNaN(numVal)) return false;

        const sliderContainer = input.closest(".gradio-slider") ||
                                input.closest(".form") ||
                                input.closest(".gradio-row") ||
                                input.parentElement?.parentElement ||
                                input.parentElement;
        const rangeInput = sliderContainer ? sliderContainer.querySelector("input[type=range]") : null;

        let changed = false;

        // 1. Update number input
        if (parseInt(input.value, 10) !== numVal) {
            input.value = numVal;
            if (typeof updateInput === "function") {
                updateInput(input);
            } else {
                const ev = new Event("input", { bubbles: true });
                Object.defineProperty(ev, "target", { value: input });
                input.dispatchEvent(ev);
            }
            input.dispatchEvent(new Event("change", { bubbles: true }));
            input.dispatchEvent(new Event("blur", { bubbles: true }));
            try {
                input.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
            } catch (e) {
                input.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
            }
            changed = true;
        }

        // 2. Update range slider input (needed for Gradio reactive store & aspectRatioOverlay.js)
        if (rangeInput && parseInt(rangeInput.value, 10) !== numVal) {
            rangeInput.value = numVal;
            if (typeof updateInput === "function") {
                updateInput(rangeInput);
            } else {
                const ev = new Event("input", { bubbles: true });
                Object.defineProperty(ev, "target", { value: rangeInput });
                rangeInput.dispatchEvent(ev);
            }
            rangeInput.dispatchEvent(new Event("change", { bubbles: true }));
            try {
                rangeInput.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
            } catch (e) {
                rangeInput.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
            }
            changed = true;
        }

        return changed;
    }

    function syncBoundsFromNative(nativeInput, customNum, customSlider, fallbackMin, fallbackMax, fallbackStep) {
        if (!nativeInput) return { min: fallbackMin, max: fallbackMax, step: fallbackStep };
        const sliderContainer = nativeInput.closest(".gradio-slider") ||
                                nativeInput.closest(".form") ||
                                nativeInput.closest(".gradio-row") ||
                                nativeInput.parentElement?.parentElement ||
                                nativeInput.parentElement;
        const rangeInput = sliderContainer ? sliderContainer.querySelector("input[type=range]") : null;

        const min = parseFloat(nativeInput.min || rangeInput?.min) || fallbackMin;
        const max = parseFloat(nativeInput.max || rangeInput?.max) || fallbackMax;
        const step = parseFloat(nativeInput.step || rangeInput?.step) || fallbackStep;

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

        // Check common aspect ratios first with small tolerance
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

        const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(w, h);
        const rw = Math.round(w / divisor);
        const rh = Math.round(h / divisor);
        if (rw <= 16 && rh <= 16) {
            return `${rw}:${rh}`;
        }

        return val > 1 ? `${val.toFixed(2)}:1` : `1:${(1 / val).toFixed(2)}`;
    }

    let activePopoverTab = null;

    function closeAllPopovers() {
        document.querySelectorAll(".sd-ar-popover").forEach((pop) => {
            pop.style.display = "none";
        });
        document.querySelectorAll(".sd-ar-trigger, .sd-ar-ratio-display").forEach((trig) => {
            trig.classList.remove("active");
        });
        activePopoverTab = null;
    }

    function positionPopover(trigger, popover) {
        if (!trigger || !popover) return;
        const rect = trigger.getBoundingClientRect();
        const popWidth = 328;
        const margin = 8;

        let left = rect.right + 12; // Default to right of the button stack
        if (left + popWidth > window.innerWidth - margin) {
            left = rect.left - popWidth - 12; // Fallback to left
        }
        if (left < margin) left = margin;

        let top = rect.top;
        const popHeight = popover.offsetHeight || 360;
        if (top + popHeight > window.innerHeight && rect.bottom > popHeight) {
            top = rect.bottom - popHeight;
        }

        popover.style.position = "fixed";
        popover.style.top = `${top}px`;
        popover.style.left = `${left}px`;
        popover.style.width = `${popWidth}px`;
        popover.style.zIndex = "10050";
    }

    function createPopoverElement(tabName) {
        let popover = document.getElementById(`${tabName}_ar_popover`);
        if (popover) return popover;

        popover = document.createElement("div");
        popover.className = "sd-ar-popover";
        popover.id = `${tabName}_ar_popover`;
        popover.style.display = "none";

        const portraitPresets = PRESETS.filter((p) => p.group === "portrait");
        const landscapePresets = PRESETS.filter((p) => p.group === "landscape");
        const squarePresets = PRESETS.filter((p) => p.group === "square");

        popover.innerHTML = `
            <div class="sd-ar-popover-header">
                <span class="sd-ar-popover-title" data-i18n="title">${t("title")}</span>
                <div class="sd-ar-popover-actions">
                    <button type="button" class="sd-ar-popover-iconbtn" title="${t("settingsTip")}">
                        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
                            <path d="M8 4.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5zM9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                            <path d="M14.07 6.45l-.94-.28a5.18 5.18 0 0 0-.46-1.12l.53-.84a.6.6 0 0 0-.14-.77l-1.46-1.46a.6.6 0 0 0-.77-.14l-.84.53c-.35-.19-.73-.34-1.12-.46L9.5 1.93A.6.6 0 0 0 8.9 1.4h-1.8a.6.6 0 0 0-.6.53l-.28.94a5.18 5.18 0 0 0-1.12.46l-.84-.53a.6.6 0 0 0-.77.14L2.03 4.4a.6.6 0 0 0-.14.77l.53.84c-.19.35-.34.73-.46 1.12l-.94.28a.6.6 0 0 0-.53.6v1.8c0 .3.22.56.53.6l.94.28c.12.39.27.77.46 1.12l-.53.84a.6.6 0 0 0 .14.77l1.46 1.46c.22.22.58.26.77.14l.84-.53c.35.19.73.34 1.12.46l.28.94c.05.31.3.53.6.53h1.8c.3 0 .56-.22.6-.53l.28-.94c.39-.12.77-.27 1.12-.46l.84.53c.2.12.55.08.77-.14l1.46-1.46a.6.6 0 0 0 .14-.77l-.53-.84c.19-.35.34-.73.46-1.12l.94-.28a.6.6 0 0 0 .53-.6v-1.8a.6.6 0 0 0-.53-.6z"/>
                        </svg>
                    </button>
                    <button type="button" class="sd-ar-popover-iconbtn sd-ar-popover-close" title="${t("closeTip")}">
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="sd-ar-popover-content">
                <!-- Portrait Section -->
                <div class="sd-ar-popover-sectitle" data-i18n="portrait">${t("portrait")}</div>
                <div class="sd-ar-popover-grid">
                    ${portraitPresets.map((p) => `
                        <button type="button" class="sd-ar-popover-btn" data-w="${p.w}" data-h="${p.h}" title="${p.w} × ${p.h} (${t(p.label)})">
                            ${p.w} × ${p.h}
                        </button>
                    `).join("")}
                </div>

                <!-- Landscape Section -->
                <div class="sd-ar-popover-sectitle" data-i18n="landscape">${t("landscape")}</div>
                <div class="sd-ar-popover-grid">
                    ${landscapePresets.map((p) => `
                        <button type="button" class="sd-ar-popover-btn" data-w="${p.w}" data-h="${p.h}" title="${p.w} × ${p.h} (${t(p.label)})">
                            ${p.w} × ${p.h}
                        </button>
                    `).join("")}
                </div>

                <!-- Square Section -->
                <div class="sd-ar-popover-sectitle" data-i18n="square">${t("square")}</div>
                <div class="sd-ar-popover-grid">
                    ${squarePresets.map((p) => `
                        <button type="button" class="sd-ar-popover-btn" data-w="${p.w}" data-h="${p.h}" title="${p.w} × ${p.h} (${t(p.label)})">
                            ${p.w} × ${p.h}
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

        panel.innerHTML = `
            <!-- Left: Dimensions & Buttons -->
            <div class="sd-ar-dims-column">
                <div class="sd-ar-dims-inputs">
                    <div class="sd-ar-slider-cell compact">
                        <input type="number" class="sd-ar-compact-num" id="${tabName}_ar_width_num" min="64" max="2048" step="8" />
                        <input type="range" class="sd-ar-compact-slider" id="${tabName}_ar_width_slider" min="64" max="2048" step="8" />
                    </div>
                    <div class="sd-ar-slider-cell compact">
                        <input type="number" class="sd-ar-compact-num" id="${tabName}_ar_height_num" min="64" max="2048" step="8" />
                        <input type="range" class="sd-ar-compact-slider" id="${tabName}_ar_height_slider" min="64" max="2048" step="8" />
                    </div>
                </div>
                
                <div class="sd-ar-actions-stack">
                    <button type="button" class="sd-ar-btn-stack sd-ar-ratio-display" id="${tabName}_ar_ratio_btn" title="${t("aspectRatio")}">1:1</button>
                    <button type="button" class="sd-ar-btn-stack sd-ar-trigger" id="${tabName}_ar_trigger_btn" title="${t("title")}">
                        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                            <rect x="2" y="2" width="5" height="5" rx="1"></rect>
                            <rect x="9" y="2" width="5" height="5" rx="1"></rect>
                            <rect x="2" y="9" width="5" height="5" rx="1"></rect>
                            <rect x="9" y="9" width="5" height="5" rx="1"></rect>
                        </svg>
                    </button>
                    <button type="button" class="sd-ar-btn-stack" id="${tabName}_ar_swap_btn" title="${t("swapTip")}">
                        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                            <path d="M4.5 2a.5.5 0 0 1 .5.5v9.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L4 12.293V2.5a.5.5 0 0 1 .5-.5zm7 12a.5.5 0 0 1-.5-.5V3.707l-2.146 2.147a.5.5 0 0 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L12 3.707V13.5a.5.5 0 0 1-.5.5z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Right: Batch -->
            <div class="sd-ar-batch-column">
                <div class="sd-ar-slider-cell">
                    <div class="sd-ar-slider-label-row">
                        <span class="sd-ar-label-name" data-i18n="batchCount">${t("batchCount")}</span>
                        <input type="number" class="sd-ar-batch-num" id="${tabName}_ar_bcount_num" min="1" max="100" step="1" />
                    </div>
                    <input type="range" class="sd-ar-compact-slider" id="${tabName}_ar_bcount_slider" min="1" max="100" step="1" />
                </div>

                <div class="sd-ar-slider-cell">
                    <div class="sd-ar-slider-label-row">
                        <span class="sd-ar-label-name" data-i18n="batchSize">${t("batchSize")}</span>
                        <input type="number" class="sd-ar-batch-num" id="${tabName}_ar_bsize_num" min="1" max="8" step="1" />
                    </div>
                    <input type="range" class="sd-ar-compact-slider" id="${tabName}_ar_bsize_slider" min="1" max="8" step="1" />
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

        document.querySelectorAll(".sd-ar-swap-btn").forEach((btn) => {
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

            const isDistilledVisible = distilledCfg && distilledCfg.offsetParent !== null;
            if (distilledCfg && isDistilledVisible && formTarget && !formTarget.contains(distilledCfg)) {
                if (!distilledCfg._origParent) distilledCfg._origParent = distilledCfg.parentElement;
                formTarget.appendChild(distilledCfg);
            }
            samplerContainer.classList.toggle("has-distilled-cfg", Boolean(isDistilledVisible));

            const cfgWrapper = (cfgScale && cfgScale._origParent) || root.querySelector(`#${tabName}_settings > div:has(#${tabName}_cfg_scale)`);
            if (cfgWrapper && cfgWrapper !== samplerContainer && cfgWrapper !== formTarget) {
                cfgWrapper.classList.add("sd-ar-orig-cfg-container");
                cfgWrapper.style.setProperty("display", "none", "important");
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

        const nativeWidthInput = root.querySelector(`#${tabName}_width input[type=number]`);
        const nativeHeightInput = root.querySelector(`#${tabName}_height input[type=number]`);
        const nativeBatchCountInput = root.querySelector(`#${tabName}_batch_count input[type=number]`);
        const nativeBatchSizeInput = root.querySelector(`#${tabName}_batch_size input[type=number]`);

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
        origDimensionsRow.parentElement.insertBefore(panel, origDimensionsRow);
        
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

        // Inherit dynamic bounds (min, max, step) directly from WebUI native elements / ui-config.json
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

        popoverBtns.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                if (e && !e.isTrusted) return;
                const w = parseInt(btn.getAttribute("data-w"), 10);
                const h = parseInt(btn.getAttribute("data-h"), 10);
                setNativeVal(nativeWidthInput, w);
                setNativeVal(nativeHeightInput, h);
                updateDimensionsUI(w, h);
                closeAllPopovers();
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

            popoverBtns.forEach((btn) => {
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
        const initW = parseInt(nativeWidthInput.value, 10) || parseInt(nativeWidthInput.getAttribute("value"), 10) || 1024;
        const initH = parseInt(nativeHeightInput.value, 10) || parseInt(nativeHeightInput.getAttribute("value"), 10) || 1024;
        updateDimensionsUI(initW, initH);
        if (nativeBatchCountInput) updateBatchCountUI(nativeBatchCountInput.value);
        if (nativeBatchSizeInput) updateBatchSizeUI(nativeBatchSizeInput.value);

        const syncFromNative = () => {
            syncAllBounds();
            const w = parseInt(nativeWidthInput.value, 10);
            const h = parseInt(nativeHeightInput.value, 10);
            if (w && h && (w !== parseInt(widthSlider.value, 10) || h !== parseInt(heightSlider.value, 10))) {
                updateDimensionsUI(w, h);
            }
            if (nativeBatchCountInput) {
                const bc = parseInt(nativeBatchCountInput.value, 10);
                if (bc && bc !== parseInt(bcountNum.value, 10)) {
                    updateBatchCountUI(bc);
                }
            }
            if (nativeBatchSizeInput) {
                const bs = parseInt(nativeBatchSizeInput.value, 10);
                if (bs && bs !== parseInt(bsizeNum.value, 10)) {
                    updateBatchSizeUI(bs);
                }
            }
        };

        nativeWidthInput.addEventListener("input", syncFromNative);
        nativeWidthInput.addEventListener("change", syncFromNative);
        nativeHeightInput.addEventListener("input", syncFromNative);
        nativeHeightInput.addEventListener("change", syncFromNative);
        if (nativeBatchCountInput) {
            nativeBatchCountInput.addEventListener("input", syncFromNative);
            nativeBatchCountInput.addEventListener("change", syncFromNative);
        }
        if (nativeBatchSizeInput) {
            nativeBatchSizeInput.addEventListener("input", syncFromNative);
            nativeBatchSizeInput.addEventListener("change", syncFromNative);
        }

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

    // Intercept localStorage.setItem in the same window so changes apply instantly
    const originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
        originalSetItem(key, value);
        if (key === "SD-LOBE-SETTING" || key === "SD-KITCHEN-SETTING" || key === "lobe_enable_aspect_ratio") {
            try {
                applyEnabledState(isAspectRatioEnabled());
                updateAllTexts();
            } catch (e) {}
        }
    };

    window.addEventListener("storage", (e) => {
        if (e.key === "SD-LOBE-SETTING" || e.key === "SD-KITCHEN-SETTING" || e.key === "lobe_enable_aspect_ratio") {
            applyEnabledState(isAspectRatioEnabled());
            updateAllTexts();
        }
    });

    if (typeof onOptionsChanged === "function") {
        onOptionsChanged(() => {
            applyEnabledState(isAspectRatioEnabled());
            updateAllTexts();
        });
    }

    let initialized = false;
    function initAll() {
        const txtOk = initTabControls("txt2img");
        const imgOk = initTabControls("img2img");
        applyEnabledState(isAspectRatioEnabled());
        updateAllTexts();
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
            setInterval(() => {
                applyEnabledState(isAspectRatioEnabled());
            }, 400);
        }
    }, 500);
})();
