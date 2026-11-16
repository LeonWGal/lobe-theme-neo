/* Forge serves the bundled engine separately so disabling autocomplete skips its load. */
(() => {
  const script = document.currentScript;
  if (!script || /^\/dev(?:\/|$)/.test(location.pathname)) return;
  const entry = new URL(script.src);
  const source = new URL("../assets/autocomplete/engine.js", entry);
  source.search = entry.search;
  source.searchParams.set("layout", "xyz-tipo");
  let loading = false;
  let failed = false;

  async function load(setting) {
    const disabled = setting?.autocompleteMode === "off" && !setting?.enableHighlight;
    if (window.lobeTagComplete || loading || failed || disabled) return;
    loading = true;
    try {
      const response = await fetch("/lobe/autocomplete/catalog");
      if (!response.ok || window.lobeTagComplete) {
        failed = true;
        return;
      }
    } catch {
      loading = false;
      return;
    }
    const latest = window.lobeThemeSetting;
    if (latest?.autocompleteMode === "off" && !latest?.enableHighlight) {
      loading = false;
      return;
    }
    const engine = document.createElement("script");
    engine.charset = "utf-8";
    engine.src = source.href;
    engine.async = true;
    engine.onerror = () => {
      failed = true;
      console.warn("[Lobe Autocomplete] Could not load the bundled engine");
    };
    document.head.append(engine);
  }

  window.addEventListener("lobe:settings", (event) => load(event.detail));
  document.addEventListener("DOMContentLoaded", () => {
    let setting = window.lobeThemeSetting;
    if (!setting) {
      try {
        setting = JSON.parse(localStorage.getItem("SD-LOBE-SETTING") || "{}");
      } catch {
        // Storage may be unavailable.
      }
    }
    load(setting);
  }, { once: true });
})();
