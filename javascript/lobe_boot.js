/* Forge loads this classic script in the head, before mounting Gradio. */
(() => {
  if (/^\/dev(?:\/|$)/.test(location.pathname)) return;

  const root = document.documentElement;
  const scriptUrl = document.currentScript?.src;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const exitDuration = { full: 480, reduced: 160 };
  function readSetting() {
    try {
      return window.lobeThemeSetting || JSON.parse(localStorage.getItem('SD-LOBE-SETTING') || localStorage.getItem('SD-KITCHEN-SETTING') || '{}');
    } catch { return {}; }
  }
  let bootSetting = readSetting();
  if (bootSetting.bootSplashMode === "off") return;
  const labels = {
    de: { interface: "Oberfläche wird geladen…", catalog: "Modellkatalog wird geladen…", previews: "Vorschauen werden geladen…" },
    en: { interface: "Loading interface…", catalog: "Loading model catalog…", previews: "Loading previews…" },
    es: { interface: "Cargando la interfaz…", catalog: "Cargando el catálogo de modelos…", previews: "Cargando las vistas previas…" },
    fr: { interface: "Chargement de l’interface…", catalog: "Chargement du catalogue de modèles…", previews: "Chargement des aperçus…" },
    ja: { interface: "インターフェースを読み込み中…", catalog: "モデルカタログを読み込み中…", previews: "プレビューを読み込み中…" },
    ko: { interface: "인터페이스 로딩 중…", catalog: "모델 목록 로딩 중…", previews: "미리 보기 로딩 중…" },
    pt: { interface: "Carregando a interface…", catalog: "Carregando o catálogo de modelos…", previews: "Carregando as prévias…" },
    ru: { interface: "Загрузка интерфейса…", catalog: "Загрузка каталога моделей…", previews: "Загрузка превью…" },
    tr: { interface: "Arayüz yükleniyor…", catalog: "Model kataloğu yükleniyor…", previews: "Önizlemeler yükleniyor…" },
    zh: { interface: "正在加载界面…", catalog: "正在加载模型目录…", previews: "正在加载预览…" },
    "zh-hant": { interface: "正在載入介面…", catalog: "正在載入模型目錄…", previews: "正在載入預覽…" },
  };
  root.dataset.lobeBoot = "";

  const style = document.createElement("style");
  style.textContent = `
    html[data-lobe-boot] { background: #050507 !important; }
    html[data-lobe-boot]::before { position:fixed; inset:0; z-index:2147483646; background:#050507; content:""; }
    #lobe-boot-screen { --boot-ease:cubic-bezier(.16,1,.3,1); --boot-exit-ease:cubic-bezier(.22,1,.36,1); position:fixed; inset:0; z-index:2147483647; overflow:hidden; isolation:isolate; background:#050507; color:#f1eff8!important; font:400 1rem/1.5 var(--boot-font,system-ui,sans-serif); transition:opacity ${exitDuration.full}ms var(--boot-exit-ease); }
    #lobe-boot-screen .lobe-boot-scene { position:absolute; inset:0; transform-origin:center center; transition:opacity ${exitDuration.full}ms var(--boot-exit-ease),transform ${exitDuration.full}ms var(--boot-exit-ease); }
    #lobe-boot-screen .lobe-boot-art { position:absolute; inset:0; isolation:isolate; overflow:hidden; pointer-events:none; }
    #lobe-boot-screen .lobe-boot-art[hidden] { display:none!important; }
    #lobe-boot-screen .lobe-boot-art canvas { position:absolute; inset:0; z-index:1; display:block; width:100%; height:100%; opacity:0; transition:opacity 240ms ease-out; }
    #lobe-boot-screen .lobe-boot-art canvas[data-playing] { opacity:1; }
    #lobe-boot-screen .lobe-boot-art:not(:has(canvas[data-playing]))::after { content:""; position:absolute; inset:0; background:radial-gradient(ellipse at 60% 42%,color-mix(in srgb,var(--boot-accent) 13%,transparent),transparent 68%); }
    #lobe-boot-screen:not([data-scene="glow"]) .lobe-glow { display:none; }
    #lobe-boot-screen[data-leaving] { opacity:0; pointer-events:none; }
    #lobe-boot-screen[data-leaving] .lobe-boot-scene { opacity:0; transform:scale(1.03); }
    #lobe-boot-screen[data-leaving] .lobe-boot-copy { opacity:0; transform:translateY(8px); }
    #lobe-boot-screen[data-leaving] .lobe-boot-scene-name { opacity:0; transform:translateY(-6px); }
    #lobe-boot-screen[data-leaving] .lobe-boot-track { opacity:0; }
    #lobe-boot-screen .lobe-glow {
      --entry-x:0%; --entry-y:-100%; --rest-x:0%; --rest-y:-50%;
      --stretch-x:1; --stretch-y:1.5;
      --rim-angle:180deg;
      position:absolute; inset:0; pointer-events:none; isolation:isolate;
      transform:translate(var(--rest-x),var(--rest-y));
      animation:lobe-horizon-enter 1600ms var(--boot-ease) both;
    }
    #lobe-boot-screen[data-glow-side="bottom"] .lobe-glow {
      --entry-y:100%; --rest-y:50%;
      --rim-angle:0deg;
    }
    #lobe-boot-screen:is([data-glow-side="left"],[data-glow-side="right"]) .lobe-glow {
      --entry-y:0%; --rest-y:0%; --stretch-x:1.04; --stretch-y:1;
      inset:auto; top:38%; margin-top:-66vh;
      width:clamp(400px,76vw,1200px); height:132vh;
    }
    #lobe-boot-screen[data-glow-side="left"] .lobe-glow {
      --entry-x:calc(-116% - 54vw); --rest-x:-116%;
      --rim-angle:90deg;
      left:48vw;
    }
    #lobe-boot-screen[data-glow-side="right"] .lobe-glow {
      --entry-x:calc(116% + 54vw); --rest-x:116%;
      --rim-angle:270deg;
      right:48vw;
    }
    #lobe-boot-screen[data-scene="glow"]:is([data-glow-side="left"],[data-glow-side="right"]) .lobe-boot-scene::after {
      content:"";position:absolute;inset:55% 0 0;pointer-events:none;
      background:linear-gradient(transparent,#050507);
    }
    #lobe-boot-screen .lobe-glow-arc { position:absolute; inset:0; border-radius:100%; }
    #lobe-boot-screen .lobe-glow-edge {
      transform:scale(1.32);
      mask-image:radial-gradient(ellipse closest-side,transparent 78%,#000 95%,transparent 100%);
      background:conic-gradient(from calc(var(--rim-angle) - 90deg),
        var(--boot-accent),color-mix(in srgb,var(--boot-accent) 30%,white) 16%,
        var(--boot-accent) 38%,color-mix(in srgb,var(--boot-accent) 58%,#566aff) 72%,var(--boot-accent));
    }
    #lobe-boot-screen .lobe-glow-reflection {
      transform:scale(1.39);
      mask-image:radial-gradient(ellipse closest-side,transparent 84%,#000 92%,transparent 100%);
      background:conic-gradient(from var(--rim-angle),var(--boot-accent),transparent 37%,transparent 72%,var(--boot-accent));
      opacity:.30;
    }
    #lobe-boot-screen .lobe-boot-copy { position:absolute; z-index:1; isolation:isolate; right:max(clamp(20px,4vw,72px),env(safe-area-inset-right)); bottom:max(clamp(20px,5vh,56px),env(safe-area-inset-bottom)); max-width:calc(100% - 40px); display:grid; justify-items:end; gap:6px; text-align:right; transition:opacity 240ms ease-out,transform 240ms var(--boot-exit-ease); }
    #lobe-boot-screen .lobe-boot-copy::before { content:""; position:absolute; z-index:-1; inset:-42px -64px; pointer-events:none; background:radial-gradient(ellipse closest-side,#050507f5 54%,#0505079c 76%,transparent); }
    #lobe-boot-screen .lobe-boot-scene-name { position:absolute; z-index:1; isolation:isolate; top:max(clamp(20px,4vh,44px),env(safe-area-inset-top)); left:max(clamp(20px,4vw,72px),env(safe-area-inset-left)); color:#d4d3d8!important; font-size:.875rem; line-height:1.25rem; font-weight:500; transition:opacity 220ms ease-out,transform 220ms var(--boot-exit-ease); }
    #lobe-boot-screen .lobe-boot-scene-name::before { content:""; position:absolute; z-index:-1; inset:-20px -32px; pointer-events:none; background:radial-gradient(ellipse closest-side,#050507e8 50%,transparent); }
    #lobe-boot-screen .lobe-boot-title { color:#f7f6f4!important; font-size:clamp(1.5rem,1.2rem + 1vw,2.25rem); font-weight:600; line-height:1.16; letter-spacing:-.02em; }
    #lobe-boot-screen .lobe-boot-brand-accent { color:var(--boot-accent,#eee)!important; }
    #lobe-boot-screen .lobe-boot-status { color:#d4d3d8!important; font-size:.875rem; line-height:1.25rem; }
    #lobe-boot-screen .lobe-boot-track { margin-top:2px; width:64px; height:2px; overflow:hidden; border-radius:2px; background:#ffffff2b; transition:opacity 100ms ease-out; }
    #lobe-boot-screen .lobe-boot-track::after { content:""; display:block; width:28px; height:100%; background:color-mix(in srgb,var(--boot-accent) 65%,white); border-radius:inherit; animation:lobe-boot-track 1700ms ease-in-out infinite alternate; }
    @keyframes lobe-boot-track { from {transform:translateX(-12px);opacity:.5} to {transform:translateX(48px);opacity:1} }
    @keyframes lobe-horizon-enter { from {transform:translate(var(--entry-x),var(--entry-y)) scale(var(--stretch-x),var(--stretch-y));opacity:0} to {transform:translate(var(--rest-x),var(--rest-y));opacity:1} }
    @media (orientation:portrait) { #lobe-boot-screen:is([data-glow-side="top"],[data-glow-side="bottom"]) .lobe-glow { left:-30%;right:-30%; } }
    @media (prefers-reduced-motion:reduce) { #lobe-boot-screen {transition-duration:${exitDuration.reduced}ms} #lobe-boot-screen *, #lobe-boot-screen *::after {animation:none!important;transition:none!important} }
  `;
  document.head.append(style);

  let screen;
  const glowSides = ["top", "bottom", "left", "right"];
  const glowSide = glowSides[Math.floor(Math.random() * glowSides.length)];
  const scenes = [
    ["Glow Horizon", "glow"],
    ["Chromatic Lens", 12],
    ["Fluted Folds", 13],
    ["Frosted Panels", 11],
    ["Fluted Glass", 5],
    ["Ride the Wave × Colorful Wave", 1],
    ["Aurora Ribbons", 20],
    ["Black Hole · VGPU", 21],
    ["Etched Accretion", 22],
    ["Infinite Plane", 34],
    ["Liquid Crystal", 37],
    ["Cosmic Ocean", 42],
    ["Neuro Noise", 49],
  ];
  function pickScene() {
    const mode = bootSetting.bootSplashMode;
    if (mode === "single") {
      const target = String(bootSetting.bootSplashScene || "");
      return scenes.find(([, id]) => String(id) === target) || scenes[0];
    }
    if (mode === "custom") {
      const allowed = new Set(
        String(bootSetting.bootSplashScenes || "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
      );
      const pool = scenes.filter(([, id]) => allowed.has(String(id)));
      const list = pool.length ? pool : scenes;
      return list[Math.floor(Math.random() * list.length)];
    }
    return scenes[Math.floor(Math.random() * scenes.length)];
  }
  const selectedScene = pickScene();
  let status;
  let sceneName;
  let sceneRenderer;
  let accentRGB = [238 / 255, 238 / 255, 238 / 255];

  let phase = "interface";
  let readinessCheck;
  let workspaceAt;
  let catalogsAt;
  let finished = false;
  const watchBody = new MutationObserver(() => {
    if (document.body) mount();
  });


  // Snapshot the installed Lobe palettes so the head script needs no React imports.
  const accents = {"blue": "#60b1ff", "cyan": "#95f3d9", "geekblue": "#0072f5", "gold": "#ffb224", "gray": "#777777", "green": "#62c473", "lime": "#c4f042", "magenta": "#e34ba9", "orange": "#ff9927", "primary": "#eeeeee", "purple": "#bd54c6", "red": "#f4416c", "volcano": "#ec5e41", "yellow": "#ffef5c", "kitchen": "#007aff"};
  function updateStatus() {
    const locale = typeof bootSetting.i18n === "string" && bootSetting.i18n ? bootSetting.i18n : navigator.language;
    const [base, variant] = locale.toLowerCase().split(/[-_]/);
    const language = base === "zh" && ["hk", "tw", "mo", "hant"].includes(variant) ? "zh-hant" : base;
    const supported = Object.hasOwn(labels, language) ? language : "en";
    const message = labels[supported][phase];
    if (status.lang !== supported) status.lang = supported;
    if (status.textContent !== message) status.textContent = message;
  }
  function applySetting(setting) {
    bootSetting = setting || {};
    if (!screen) return;
    const value = bootSetting.primaryColor;
    const selectedAccent = Object.hasOwn(accents, value)
      ? accents[value]
      : /^#[0-9a-f]{6}$/i.test(value || '') ? value : undefined;
    const color = selectedAccent ?? accents.primary;
    screen.style.setProperty('--boot-accent', color);
    const rgb = parseInt(color.slice(1), 16);
    accentRGB = [rgb >> 16, (rgb >> 8) & 255, rgb & 255].map((channel) => channel / 255);
    sceneRenderer?.setAccent(accentRGB);
    updateStatus();
  }
  const settingsChanged = (event) => applySetting(event.detail);
  window.addEventListener('lobe:settings', settingsChanged);

  function mount() {
    watchBody.disconnect();
    if (finished) return;
    screen = document.createElement("div");
    screen.id = "lobe-boot-screen";
    screen.dataset.scene = selectedScene[1] === "glow" ? "glow" : "pending";
    screen.dataset.glowSide = glowSide;
    screen.innerHTML = `
      <div class="lobe-boot-scene">
      <div class="lobe-boot-art" hidden aria-hidden="true"></div>
      <div class="lobe-glow" aria-hidden="true">
        <div class="lobe-glow-arc lobe-glow-edge"></div>
        <div class="lobe-glow-arc lobe-glow-reflection"></div>
      </div>
      <span class="lobe-boot-scene-name" lang="en">Glow Horizon</span>
      <div class="lobe-boot-copy">
        <span class="lobe-boot-title" lang="en">Lobe Theme <span class="lobe-boot-brand-accent">Neo</span></span>
        <span class="lobe-boot-status" role="status"></span>
        <span class="lobe-boot-track" aria-hidden="true"></span>
      </div></div>`;
    status = screen.querySelector(".lobe-boot-status");
    sceneName = screen.querySelector(".lobe-boot-scene-name");
    sceneName.textContent = selectedScene[0];
    // Pick the font once to avoid a visible swap while the app loads.
    const loadedWeights = new Set([...document.fonts]
      .filter((face) => face.family === "HarmonyOS Sans" && face.status === "loaded")
      .map((face) => face.weight));
    if ((loadedWeights.has("normal") || loadedWeights.has("400")) &&
      (loadedWeights.has("bold") || loadedWeights.has("700"))) {
      screen.style.setProperty("--boot-font", '"HarmonyOS Sans",system-ui,sans-serif');
    }
    applySetting(bootSetting);
    document.body.append(screen);
    readinessCheck = setInterval(checkWorkspace, 240);
    checkWorkspace();
    if (!finished && selectedScene[1] !== "glow") {
      loadSceneArt(screen.querySelector(".lobe-boot-art"));
    }
  }

  function activeCatalog(sidebar) {
    const pages = sidebar.querySelectorAll("#txt2img_extra_tabs .extra-page, #img2img_extra_tabs .extra-page");
    return Array.from(pages).find((page) => page.getClientRects().length);
  }

  function visiblePreviewsReady(sidebar, catalog) {
    const bounds = sidebar.getBoundingClientRect();
    if (bounds.height <= 0) return true;
    for (const preview of catalog.querySelectorAll("img.preview, video.preview")) {
      if (preview instanceof HTMLImageElement ? preview.complete : preview.readyState >= 2 || preview.error) continue;
      const rect = preview.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.bottom > Math.max(0, bounds.top) &&
        rect.top < Math.min(innerHeight, bounds.bottom)) return false;
    }
    return true;
  }

  function checkWorkspace() {
    if (!screen) return;
    const app = (typeof gradioApp === "function" && gradioApp()) || document;
    if (!app.querySelector(".lobe-app-header") || !app.querySelector("#txt2img_prompt") ||
      !app.querySelector("#txt2img_generate")) return;

    const sidebar = app.querySelector(".lobe-sidebar-right:not(.lobe-sidebar-hidden) .lobe-extra-network-body");
    if (!sidebar || !sidebar.getClientRects().length) return finish();

    const now = performance.now();
    workspaceAt ??= now;
    const catalog = activeCatalog(sidebar);
    if (!catalog?.querySelector(".extra-network-cards :is(.card, .nocards), .lobe-network-pagination")) {
      if (now - workspaceAt >= 3500) return finish();
      phase = "catalog";
      updateStatus();
      return;
    }
    catalogsAt ??= now;
    if (visiblePreviewsReady(sidebar, catalog) || now - catalogsAt >= 1200) finish();
    else {
      phase = "previews";
      updateStatus();
    }
  }

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    clearInterval(readinessCheck);
    window.removeEventListener("lobe:ready", checkWorkspace);
    window.removeEventListener("lobe:settings", settingsChanged);
    reducedMotion.removeEventListener("change", motionChanged);
    watchBody.disconnect();
    const remove = () => {
      delete root.dataset.lobeBoot;
      sceneRenderer?.dispose();
      screen?.remove();
      style.remove();
    };
    if (!screen) remove();
    else {
      const backup = setTimeout(remove, (reducedMotion.matches ? exitDuration.reduced : exitDuration.full) + 80);
      screen.addEventListener("transitionend", (event) => {
        if (event.target !== screen || event.propertyName !== "opacity") return;
        clearTimeout(backup);
        remove();
      });
      screen.dataset.leaving = "";
      requestAnimationFrame(() => {
        delete root.dataset.lobeBoot;
      });
    }
  }

  function loadSceneArt(art) {
    const [name, id] = selectedScene;
    const fallback = () => {
      if (finished) return;
      screen.dataset.scene = "glow";
      sceneName.textContent = scenes[0][0];
    };
    if (!scriptUrl || reducedMotion.matches) return fallback();
    const entry = new URL(scriptUrl);
    const renderer = new URL("../assets/boot/render.mjs", entry);
    renderer.search = entry.search;
    // Start after the browser has had a chance to paint the loading screen.
    requestAnimationFrame(() => requestAnimationFrame(async () => {
      if (finished || reducedMotion.matches) return;
      const canvas = document.createElement("canvas");
      try {
        const { renderScene } = await import(renderer.href);
        if (finished || reducedMotion.matches) return;
        art.append(canvas);
        sceneRenderer = renderScene(canvas, id, accentRGB, () => {
          art.hidden = false;
          screen.dataset.scene = String(id);
          sceneName.textContent = name;
          canvas.dataset.playing = "";
        }, () => {
          sceneRenderer = undefined;
          fallback();
        });
      } catch {
        canvas.remove();
        fallback();
      }
    }));
  }

  function motionChanged(event) {
    if (!event.matches) return;
    sceneRenderer?.dispose();
    sceneRenderer = undefined;
  }

  // Even a failed initialization must release the native interface.
  const timeout = setTimeout(finish, 24000);
  reducedMotion.addEventListener("change", motionChanged);
  window.addEventListener("lobe:ready", checkWorkspace);
  if (document.body) mount();
  else watchBody.observe(root, { childList: true });
})();
