import * as THREE from "three";

export interface PointerState {
  readonly current: THREE.Vector3; // x, y, active [0..1]
  readonly velocity: THREE.Vector2;
}

export class PointerTracker {
  private targetX = 0;
  private targetY = 0;
  private currentX = 0;
  private currentY = 0;
  private prevX = 0;
  private prevY = 0;
  private currentVx = 0;
  private currentVy = 0;
  private targetActive = 0;
  private currentActive = 0;

  readonly pointerVec = new THREE.Vector3(0, 0, 0);
  readonly velocityVec = new THREE.Vector2(0, 0);

  private isAttached = false;
  private cleanupListeners: (() => void) | null = null;

  attach(container?: HTMLElement | Window): () => void {
    if (typeof window === "undefined" || this.isAttached) {
      return () => {};
    }

    this.isAttached = true;
    const target = container || window;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;

      // Normalize to [-1, 1], flipping Y for standard Cartesian WebGL coordinates
      this.targetX = (clientX / width) * 2 - 1;
      this.targetY = -(clientY / height) * 2 + 1;
      this.targetActive = 1.0;
    };

    const handlePointerLeave = () => {
      this.targetActive = 0.0;
    };

    target.addEventListener("mousemove", handlePointerMove as EventListener, { passive: true });
    target.addEventListener("touchmove", handlePointerMove as EventListener, { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave, { passive: true });
    window.addEventListener("touchend", handlePointerLeave, { passive: true });

    this.cleanupListeners = () => {
      target.removeEventListener("mousemove", handlePointerMove as EventListener);
      target.removeEventListener("touchmove", handlePointerMove as EventListener);
      window.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("touchend", handlePointerLeave);
      this.isAttached = false;
    };

    return this.cleanupListeners;
  }

  update(delta: number): PointerState {
    const safeDelta = Math.min(delta, 0.1);
    const damping = Math.min(safeDelta * 12.0, 1.0);

    // Smooth position
    this.currentX += (this.targetX - this.currentX) * damping;
    this.currentY += (this.targetY - this.currentY) * damping;

    // Compute smoothed velocity
    const rawVx = (this.currentX - this.prevX) / Math.max(safeDelta, 0.001);
    const rawVy = (this.currentY - this.prevY) / Math.max(safeDelta, 0.001);

    this.currentVx += (rawVx - this.currentVx) * damping;
    this.currentVy += (rawVy - this.currentVy) * damping;

    this.prevX = this.currentX;
    this.prevY = this.currentY;

    // Smooth active intensity
    this.currentActive += (this.targetActive - this.currentActive) * (safeDelta * 4.0);

    this.pointerVec.set(this.currentX, this.currentY, this.currentActive);
    this.velocityVec.set(
      THREE.MathUtils.clamp(this.currentVx, -4.0, 4.0),
      THREE.MathUtils.clamp(this.currentVy, -4.0, 4.0),
    );

    return {
      current: this.pointerVec,
      velocity: this.velocityVec,
    };
  }

  dispose(): void {
    this.cleanupListeners?.();
    this.cleanupListeners = null;
    this.isAttached = false;
  }
}
