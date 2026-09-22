/**
 * Sync custom logo to site favicon (Supports URLs, Base64, and Emojis via Canvas)
 */
(function () {
    const SETTING_KEY = "SD-LOBE-SETTING";
    const SETTING_KEY_FALLBACK = "SD-KITCHEN-SETTING";
    
    // Cache the generated PNGs to avoid redrawing
    const emojiCache = {};

    function getCustomLogoUrl() {
        try {
            let raw = localStorage.getItem(SETTING_KEY);
            if (!raw) raw = localStorage.getItem(SETTING_KEY_FALLBACK);
            if (!raw) return null;
            
            const settings = JSON.parse(raw);
            if (settings.logoType === "custom" && settings.logoCustomUrl) {
                return settings.logoCustomUrl.trim();
            }
        } catch (e) {
            // ignore
        }
        return null;
    }

    function createFaviconHref(input) {
        // If it looks like a URL or Base64, return as is
        if (input.startsWith('http') || input.startsWith('data:') || input.startsWith('/') || input.startsWith('.')) {
            return input;
        }
        
        // Return from cache if we already drew this emoji
        if (emojiCache[input]) {
            return emojiCache[input];
        }

        // Draw emoji to Canvas to generate a universally supported PNG
        try {
            const canvas = document.createElement("canvas");
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext("2d");
            
            ctx.font = "48px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(input, 32, 36);
            
            const dataUrl = canvas.toDataURL("image/png");
            emojiCache[input] = dataUrl;
            return dataUrl;
        } catch(e) {
            console.warn("Failed to generate emoji favicon", e);
            return input;
        }
    }

    function enforceFavicon() {
        const rawUrl = getCustomLogoUrl();
        if (!rawUrl) return;
        
        const url = createFaviconHref(rawUrl);
        let needsUpdate = false;
        
        // Remove any favicon that is not ours
        document.querySelectorAll("link[rel*='icon']").forEach(link => {
            if (link.id !== "sd-lobe-custom-favicon") {
                link.remove();
                needsUpdate = true;
            }
        });

        // Ensure our custom favicon exists
        let customFav = document.getElementById("sd-lobe-custom-favicon");
        if (!customFav) {
            customFav = document.createElement("link");
            customFav.id = "sd-lobe-custom-favicon";
            customFav.rel = "icon";
            customFav.type = "image/png"; // Explicitly state it's a PNG now
            document.head.appendChild(customFav);
            needsUpdate = true;
        }

        if (customFav.getAttribute("href") !== url) {
            customFav.setAttribute("href", url);
            customFav.setAttribute("type", "image/png");
            
            // Force browser refresh by cloning and replacing
            const newFav = customFav.cloneNode();
            document.head.appendChild(newFav);
            customFav.remove();
            
            needsUpdate = true;
        }

        return needsUpdate;
    }

    // Run on load
    document.addEventListener("DOMContentLoaded", () => {
        enforceFavicon();
    });

    // Observe <head> for any interference from React Helmet or Gradio
    const observer = new MutationObserver(() => {
        observer.disconnect();
        enforceFavicon();
        observer.observe(document.head, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['href', 'rel']
        });
    });

    observer.observe(document.head, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['href', 'rel']
    });

    // Also watch localStorage for immediate updates
    window.addEventListener("storage", (e) => {
        if (e.key === SETTING_KEY || e.key === SETTING_KEY_FALLBACK) {
            enforceFavicon();
        }
    });

})();
