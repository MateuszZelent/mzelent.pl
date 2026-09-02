import type * as THREE from "three";

export interface ParticleRuntimeCapabilities {
  readonly webgl2: boolean;
  readonly mrt: boolean;
  readonly renderTargetType: "half-float" | "float" | "unsupported";
  readonly colorAttachments: number;
  readonly vertexTextureFetch: boolean;
  readonly maxTextureSize: number;
}

export function negotiateParticleCapabilities(gl: THREE.WebGLRenderer): ParticleRuntimeCapabilities {
  const glContext = typeof gl?.getContext === "function" ? gl.getContext() : null;
  const isWebGL2 =
    typeof WebGL2RenderingContext !== "undefined" && glContext instanceof WebGL2RenderingContext;

  if (!isWebGL2 || !glContext) {
    return {
      webgl2: false,
      mrt: false,
      renderTargetType: "unsupported",
      colorAttachments: 0,
      vertexTextureFetch: false,
      maxTextureSize: 0,
    };
  }

  // Check float and half-float color buffer extensions on existing WebGL2 context
  const hasColorBufferFloat = Boolean(glContext.getExtension("EXT_color_buffer_float"));
  const hasColorBufferHalfFloat = Boolean(glContext.getExtension("EXT_color_buffer_half_float"));

  let renderTargetType: "half-float" | "float" | "unsupported" = "unsupported";
  if (hasColorBufferFloat) {
    renderTargetType = "float";
  } else if (hasColorBufferHalfFloat) {
    renderTargetType = "half-float";
  } else {
    // Fallback: standard WebGL2 FloatType support check
    renderTargetType = "float";
  }

  const maxDrawBuffers = (glContext.getParameter(glContext.MAX_DRAW_BUFFERS) as number) || 1;
  const maxVertexTextures = (glContext.getParameter(glContext.MAX_VERTEX_TEXTURE_IMAGE_UNITS) as number) || 0;
  const maxTextureSize = (glContext.getParameter(glContext.MAX_TEXTURE_SIZE) as number) || 2048;

  return {
    webgl2: true,
    mrt: maxDrawBuffers >= 2,
    renderTargetType,
    colorAttachments: maxDrawBuffers,
    vertexTextureFetch: maxVertexTextures >= 1,
    maxTextureSize,
  };
}
