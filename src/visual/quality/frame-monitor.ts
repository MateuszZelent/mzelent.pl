export interface FrameMetrics {
  readonly sampleCount: number;
  readonly lastDurationMs: number;
  readonly p50Ms: number;
  readonly p95Ms: number;
}

export class FrameMonitor {
  private readonly maxSamples: number;
  private readonly samples: number[] = [];
  private lastTimestamp = 0;

  constructor(maxSamples = 60) {
    this.maxSamples = maxSamples;
  }

  recordFrame(now: number): void {
    if (this.lastTimestamp > 0) {
      const delta = now - this.lastTimestamp;
      if (delta > 0 && delta < 1000) {
        this.samples.push(delta);
        if (this.samples.length > this.maxSamples) {
          this.samples.shift();
        }
      }
    }
    this.lastTimestamp = now;
  }

  getMetrics(): FrameMetrics {
    if (this.samples.length === 0) {
      return { sampleCount: 0, lastDurationMs: 0, p50Ms: 0, p95Ms: 0 };
    }

    const sorted = [...this.samples].sort((a, b) => a - b);
    const p50Index = Math.floor(sorted.length * 0.5);
    const p95Index = Math.min(Math.floor(sorted.length * 0.95), sorted.length - 1);

    return {
      sampleCount: this.samples.length,
      lastDurationMs: this.samples[this.samples.length - 1] ?? 0,
      p50Ms: Number((sorted[p50Index] ?? 0).toFixed(2)),
      p95Ms: Number((sorted[p95Index] ?? 0).toFixed(2)),
    };
  }

  reset(): void {
    this.samples.length = 0;
    this.lastTimestamp = 0;
  }
}
