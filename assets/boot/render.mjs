// The main thread owns the DOM canvas and forwards viewport and theme changes.
export function renderScene(canvas, scene, accent, onFirstFrame, onFailure) {
  if (typeof Worker !== "function" || typeof canvas.transferControlToOffscreen !== "function") {
    throw new Error("OffscreenCanvas worker unavailable");
  }

  const url = new URL("./render-worker.mjs", import.meta.url);
  url.search = new URL(import.meta.url).search;
  const worker = new Worker(url, { type: "module", name: "lobe-splash" });
  let disposed = false;
  let paused = false;
  let resolution;
  let deviceScale;
  let ready = false;
  let timeout;

  // Also handle a monitor/DPR change with the same CSS viewport size.
  let watchedScale;
  function resize() {
    if (paused || disposed) return;
    const scale = window.devicePixelRatio || 1;
    if (scale !== watchedScale) {
      watchedScale = scale;
      deviceScale?.removeEventListener("change", resize);
      deviceScale = matchMedia(`(resolution: ${scale}dppx)`);
      deviceScale.addEventListener("change", resize);
    }
    const ratio = Math.min(scale, 1.5);
    const width = Math.max(1, Math.floor(window.innerWidth * ratio));
    const height = Math.max(1, Math.floor(window.innerHeight * ratio));
    if (width === resolution?.width && height === resolution?.height) return;
    resolution = { width, height };
    worker.postMessage({ type: "resize", ...resolution });
  }

  function visibilityChanged() {
    if (paused || disposed) return;
    const visible = !document.hidden;
    worker.postMessage({ type: "visibility", visible });
    clearTimeout(timeout);
    if (visible && !ready) timeout = setTimeout(firstFrameTimedOut, 5000);
  }

  function pause() {
    if (disposed || paused) return;
    paused = true;
    clearTimeout(timeout);
    worker.postMessage({ type: "visibility", visible: false });
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    clearTimeout(timeout);
    deviceScale?.removeEventListener("change", resize);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", visibilityChanged);
    worker.terminate();
    canvas.remove();
  }

  function fail(error) {
    if (disposed) return;
    dispose();
    onFailure(error);
  }

  function firstFrameTimedOut() {
    fail(new Error("Splash worker did not render its first frame"));
  }

  worker.onerror = fail;
  worker.onmessageerror = fail;
  worker.onmessage = ({ data }) => {
    if (data.type === "error") fail(new Error(data.message));
    if (data.type === "ready" && !disposed && !paused) {
      ready = true;
      clearTimeout(timeout);
      onFirstFrame(data);
    }
  };

  try {
    const offscreen = canvas.transferControlToOffscreen();
    worker.postMessage({ type: "start", canvas: offscreen, scene, accent, visible: !document.hidden }, [offscreen]);
    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibilityChanged);
    if (!document.hidden) timeout = setTimeout(firstFrameTimedOut, 5000);
    return {
      pause,
      dispose,
      setAccent(color) {
        if (!disposed && !paused) worker.postMessage({ type: "accent", accent: color });
      },
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
