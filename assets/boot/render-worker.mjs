import { fragmentForScene, vertex } from "./scenes.mjs";

let canvas;
let gl;
let program;
let parallel;
let uniforms;
let width;
let height;
let accent;
let visible = false;
let frame;
let previousTime;
let elapsed = 0;
let firstFrame = true;
let failed = false;

function fail(error) {
  if (failed) return;
  failed = true;
  if (frame !== undefined) cancelAnimationFrame(frame);
  frame = undefined;
  self.postMessage({ type: "error", message: String(error) });
}

function schedule() {
  if (visible && !failed && width && height && program && frame === undefined) {
    frame = requestAnimationFrame(draw);
  }
}

function draw(now) {
  frame = undefined;
  try {
    if (!uniforms) {
      if (parallel && !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) {
        schedule();
        return;
      }
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || "Splash shader could not be linked");
      }
      gl.useProgram(program);
      uniforms = ["size", "time", "accent"].map((name) => gl.getUniformLocation(program, name));
    }

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    elapsed += previousTime === undefined ? 0 : Math.min(100, now - previousTime);
    previousTime = now;
    gl.uniform2f(uniforms[0], width, height);
    gl.uniform1f(uniforms[1], elapsed / 1000);
    gl.uniform3fv(uniforms[2], accent);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (firstFrame) {
      firstFrame = false;
      self.postMessage({ type: "ready", width: gl.drawingBufferWidth, height: gl.drawingBufferHeight });
    }
    schedule();
  } catch (error) {
    fail(error);
  }
}

function start(data) {
  if (typeof requestAnimationFrame !== "function") throw new Error("Worker animation frames unavailable");
  canvas = data.canvas;
  accent = data.accent;
  visible = data.visible;
  gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) throw new Error("Worker WebGL2 unavailable");
  canvas.addEventListener("webglcontextlost", () => fail("Splash WebGL context lost"));
  program = gl.createProgram();
  parallel = gl.getExtension("KHR_parallel_shader_compile");

  for (const [type, code] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragmentForScene(data.scene)]]) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    gl.deleteShader(shader); // Released by WebGL once the program no longer needs it.
  }
  gl.linkProgram(program);
}

self.onmessage = ({ data }) => {
  if (failed) return;
  try {
    if (data.type === "start") start(data);
    else if (data.type === "resize") {
      const limit = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
      const scale = Math.min(1, limit / Math.max(data.width, data.height));
      width = Math.max(1, Math.floor(data.width * scale));
      height = Math.max(1, Math.floor(data.height * scale));
    } else if (data.type === "accent") {
      accent = data.accent;
    } else if (data.type === "visibility") {
      visible = data.visible;
      previousTime = undefined;
      if (!visible && frame !== undefined) {
        cancelAnimationFrame(frame);
        frame = undefined;
      }
    }
    schedule();
  } catch (error) {
    fail(error);
  }
};
