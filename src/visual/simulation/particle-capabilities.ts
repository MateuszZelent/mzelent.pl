import type * as THREE from "three";

import type { RenderTargetFormat, StaticReason } from "../state/scene-contract";

export interface ParticleRuntimeCapabilities {
  readonly webgl2: boolean;
  readonly vertexTextureFetch: boolean;
  readonly fragmentHighPrecision: boolean;
  readonly renderTargetFormat: RenderTargetFormat;
  readonly framebufferComplete: boolean;
  readonly staticReason: StaticReason;
}

function probeFramebufferCompleteness(gl: WebGL2RenderingContext, internalFormat: number): boolean {
  try {
    const prevFb = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    const prevTex = gl.getParameter(gl.TEXTURE_BINDING_2D);

    const fb = gl.createFramebuffer();
    const tex = gl.createTexture();
    if (!fb || !tex) return false;

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, internalFormat, 2, 2);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    const isComplete = status === gl.FRAMEBUFFER_COMPLETE;

    gl.bindFramebuffer(gl.FRAMEBUFFER, prevFb);
    gl.bindTexture(gl.TEXTURE_2D, prevTex);
    gl.deleteTexture(tex);
    gl.deleteFramebuffer(fb);

    return isComplete;
  } catch {
    return false;
  }
}

export function negotiateParticleCapabilities(renderer: THREE.WebGLRenderer): ParticleRuntimeCapabilities {
  const glContext = typeof renderer?.getContext === "function" ? renderer.getContext() : null;
  const isWebGL2 =
    typeof WebGL2RenderingContext !== "undefined" && glContext instanceof WebGL2RenderingContext;

  if (!isWebGL2 || !glContext) {
    return {
      webgl2: false,
      vertexTextureFetch: false,
      fragmentHighPrecision: false,
      renderTargetFormat: "unsupported",
      framebufferComplete: false,
      staticReason: "no-webgl2",
    };
  }

  // 1. Vertex texture fetch capability
  const maxVertexTextures = (glContext.getParameter(glContext.MAX_VERTEX_TEXTURE_IMAGE_UNITS) as number) || 0;
  const vertexTextureFetch = maxVertexTextures >= 1;

  // 2. Fragment shader high precision capability
  const precisionFormat = glContext.getShaderPrecisionFormat(glContext.FRAGMENT_SHADER, glContext.HIGH_FLOAT);
  const fragmentHighPrecision = (precisionFormat?.precision ?? 0) > 0;

  if (!vertexTextureFetch || !fragmentHighPrecision) {
    return {
      webgl2: true,
      vertexTextureFetch,
      fragmentHighPrecision,
      renderTargetFormat: "unsupported",
      framebufferComplete: false,
      staticReason: "unsupported-render-target",
    };
  }

  // 3. Ensure float color buffer extension is activated on WebGL2 context
  glContext.getExtension("EXT_color_buffer_float");

  // 4. Probe RGBA16F (preferred) and RGBA32F (fallback) framebuffer completeness
  const rgba16fComplete = probeFramebufferCompleteness(glContext, glContext.RGBA16F);
  if (rgba16fComplete) {
    return {
      webgl2: true,
      vertexTextureFetch: true,
      fragmentHighPrecision: true,
      renderTargetFormat: "rgba16f",
      framebufferComplete: true,
      staticReason: null,
    };
  }

  const rgba32fComplete = probeFramebufferCompleteness(glContext, glContext.RGBA32F);
  if (rgba32fComplete) {
    return {
      webgl2: true,
      vertexTextureFetch: true,
      fragmentHighPrecision: true,
      renderTargetFormat: "rgba32f",
      framebufferComplete: true,
      staticReason: null,
    };
  }

  return {
    webgl2: true,
    vertexTextureFetch: true,
    fragmentHighPrecision: true,
    renderTargetFormat: "unsupported",
    framebufferComplete: false,
    staticReason: "unsupported-render-target",
  };
}
