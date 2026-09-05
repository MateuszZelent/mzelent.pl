export interface FrameMetrics {
  readonly sampleCount: number;
  readonly lastDurationMs: number;
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly worstMs: number;
  readonly slowFrameCount: number;
  readonly firstFrameTimeMs: number;
}

export class FrameMonitor {
  private readonly maxSamples: number;
  private readonly samples: number[] = [];
  private startTimestamp: number;
  private lastTimestamp = 0;
  private firstFrameTimeMs = 0;
  private slowFrameCount = 0;

  constructor(maxSamples = 120) {
    this.maxSamples = maxSamples;
    this.startTimestamp = typeof performance !== "undefined" ? performance.now() : 0;
  }

  recordFrame(now: number): void {
    if (this.lastTimestamp === 0 && this.startTimestamp > 0) {
      this.firstFrameTimeMs = Number((now - this.startTimestamp).toFixed(2));
    }

    if (this.lastTimestamp > 0) {
      const delta = now - this.lastTimestamp;
      if (delta > 0 && delta < 1000) {
        this.samples.push(delta);
        if (delta > 33.33) {
          this.slowFrameCount++;
        }
        if (this.samples.length > this.maxSamples) {
          this.samples.shift();
        }
      }
    }
    this.lastTimestamp = now;
  }

  getMetrics(): FrameMetrics {
    if (this.samples.length === 0) {
      return {
        sampleCount: 0,
        lastDurationMs: 0,
        p50Ms: 0,
        p95Ms: 0,
        worstMs: 0,
        slowFrameCount: this.slowFrameCount,
        firstFrameTimeMs: this.firstFrameTimeMs,
      };
    }

    const sorted = [...this.samples].sort((a, b) => a - b);
    const p50Index = Math.floor(sorted.length * 0.5);
    const p95Index = Math.min(Math.floor(sorted.length * 0.95), sorted.length - 1);
    const worst = sorted[sorted.length - 1] ?? 0;

    return {
      sampleCount: this.samples.length,
      lastDurationMs: Number((this.samples[this.samples.length - 1] ?? 0).toFixed(2)),
      p50Ms: Number((sorted[p50Index] ?? 0).toFixed(2)),
      p95Ms: Number((sorted[p95Index] ?? 0).toFixed(2)),
      worstMs: Number(worst.toFixed(2)),
      slowFrameCount: this.slowFrameCount,
      firstFrameTimeMs: this.firstFrameTimeMs,
    };
  }

  reset(): void {
    this.samples.length = 0;
    this.lastTimestamp = 0;
    this.firstFrameTimeMs = 0;
    this.slowFrameCount = 0;
    this.startTimestamp = typeof performance !== "undefined" ? performance.now() : 0;
  }
}
