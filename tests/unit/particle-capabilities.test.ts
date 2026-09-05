import type * as THREE from "three";
import { describe, expect, it, vi } from "vitest";

import { negotiateParticleCapabilities } from "../../src/visual/simulation/particle-capabilities";

if (typeof globalThis.WebGL2RenderingContext === "undefined") {
  class MockWebGL2RenderingContext {}
  (globalThis as any).WebGL2RenderingContext = MockWebGL2RenderingContext;
}

function createMockGlContext(
  overrides: {
    isWebGL2?: boolean;
    maxVertexTextures?: number;
    highPrecision?: number;
    rgba16fStatus?: number;
    rgba32fStatus?: number;
  } = {},
): WebGL2RenderingContext {
  const {
    isWebGL2 = true,
    maxVertexTextures = 16,
    highPrecision = 24,
    rgba16fStatus = 0x8cd5, // FRAMEBUFFER_COMPLETE
    rgba32fStatus = 0x8cd5,
  } = overrides;

  let currentFb: any = null;
  let currentTex: any = null;

  const gl = {
    MAX_VERTEX_TEXTURE_IMAGE_UNITS: 0x8b4c,
    FRAGMENT_SHADER: 0x8b30,
    HIGH_FLOAT: 0x8dfa,
    FRAMEBUFFER_BINDING: 0x8ca6,
    TEXTURE_BINDING_2D: 0x8069,
    TEXTURE_2D: 0x0de1,
    FRAMEBUFFER: 0x8d40,
    COLOR_ATTACHMENT0: 0x8ce0,
    FRAMEBUFFER_COMPLETE: 0x8cd5,
    RGBA16F: 0x881a,
    RGBA32F: 0x8814,

    getParameter: vi.fn((param: number) => {
      if (param === 0x8b4c) return maxVertexTextures;
      if (param === 0x8ca6) return currentFb;
      if (param === 0x8069) return currentTex;
      return 0;
    }),

    getShaderPrecisionFormat: vi.fn((_shader: number, _type: number) => ({
      rangeMin: 127,
      rangeMax: 127,
      precision: highPrecision,
    })),

    getExtension: vi.fn().mockReturnValue({}),
    createFramebuffer: vi.fn().mockReturnValue({ id: "fb" }),
    createTexture: vi.fn().mockReturnValue({ id: "tex" }),
    bindTexture: vi.fn((_target: number, tex: any) => {
      currentTex = tex;
    }),
    bindFramebuffer: vi.fn((_target: number, fb: any) => {
      currentFb = fb;
    }),
    texStorage2D: vi.fn(),
    framebufferTexture2D: vi.fn(),
    checkFramebufferStatus: vi.fn((_target: number) => {
      // Determine based on bound texture format or mock
      return rgba16fStatus;
    }),
    deleteTexture: vi.fn(),
    deleteFramebuffer: vi.fn(),
  };

  if (isWebGL2) {
    Object.setPrototypeOf(gl, WebGL2RenderingContext.prototype);
  }

  return gl as unknown as WebGL2RenderingContext;
}

describe("negotiateParticleCapabilities", () => {
  it("returns staticReason 'no-webgl2' when renderer context is not WebGL2", () => {
    const mockRenderer = {
      getContext: () => null,
    } as unknown as THREE.WebGLRenderer;

    const capabilities = negotiateParticleCapabilities(mockRenderer);
    expect(capabilities.webgl2).toBe(false);
    expect(capabilities.renderTargetFormat).toBe("unsupported");
    expect(capabilities.framebufferComplete).toBe(false);
    expect(capabilities.staticReason).toBe("no-webgl2");
  });

  it("returns staticReason 'unsupported-render-target' when vertex texture units < 1", () => {
    const gl = createMockGlContext({ maxVertexTextures: 0 });
    const mockRenderer = {
      getContext: () => gl,
    } as unknown as THREE.WebGLRenderer;

    const capabilities = negotiateParticleCapabilities(mockRenderer);
    expect(capabilities.webgl2).toBe(true);
    expect(capabilities.vertexTextureFetch).toBe(false);
    expect(capabilities.renderTargetFormat).toBe("unsupported");
    expect(capabilities.staticReason).toBe("unsupported-render-target");
  });

  it("returns staticReason 'unsupported-render-target' when fragment high precision is missing", () => {
    const gl = createMockGlContext({ highPrecision: 0 });
    const mockRenderer = {
      getContext: () => gl,
    } as unknown as THREE.WebGLRenderer;

    const capabilities = negotiateParticleCapabilities(mockRenderer);
    expect(capabilities.webgl2).toBe(true);
    expect(capabilities.fragmentHighPrecision).toBe(false);
    expect(capabilities.renderTargetFormat).toBe("unsupported");
    expect(capabilities.staticReason).toBe("unsupported-render-target");
  });

  it("negotiates rgba16f as preferred format when RGBA16F framebuffer is complete", () => {
    const gl = createMockGlContext({ rgba16fStatus: 0x8cd5 });
    const mockRenderer = {
      getContext: () => gl,
    } as unknown as THREE.WebGLRenderer;

    const capabilities = negotiateParticleCapabilities(mockRenderer);
    expect(capabilities.webgl2).toBe(true);
    expect(capabilities.vertexTextureFetch).toBe(true);
    expect(capabilities.fragmentHighPrecision).toBe(true);
    expect(capabilities.renderTargetFormat).toBe("rgba16f");
    expect(capabilities.framebufferComplete).toBe(true);
    expect(capabilities.staticReason).toBeNull();
  });

  it("falls back to rgba32f when RGBA16F is incomplete but RGBA32F is complete", () => {
    let callCount = 0;
    const gl = createMockGlContext();
    gl.checkFramebufferStatus = vi.fn(() => {
      callCount++;
      return callCount === 1 ? 0 : 0x8cd5; // First check (16f) fails, second (32f) passes
    });

    const mockRenderer = {
      getContext: () => gl,
    } as unknown as THREE.WebGLRenderer;

    const capabilities = negotiateParticleCapabilities(mockRenderer);
    expect(capabilities.renderTargetFormat).toBe("rgba32f");
    expect(capabilities.framebufferComplete).toBe(true);
    expect(capabilities.staticReason).toBeNull();
  });

  it("returns unsupported when both RGBA16F and RGBA32F fail completeness probe", () => {
    const gl = createMockGlContext({ rgba16fStatus: 0 });
    gl.checkFramebufferStatus = vi.fn().mockReturnValue(0);

    const mockRenderer = {
      getContext: () => gl,
    } as unknown as THREE.WebGLRenderer;

    const capabilities = negotiateParticleCapabilities(mockRenderer);
    expect(capabilities.renderTargetFormat).toBe("unsupported");
    expect(capabilities.framebufferComplete).toBe(false);
    expect(capabilities.staticReason).toBe("unsupported-render-target");
  });
});
