export type CabinetFrame = CanvasImageSource & {
  width: number;
  height: number;
  close?: () => void;
};

type CacheEntry = { image: CabinetFrame; used: number };
type FrameJob = {
  index: number;
  priority: number;
  wanted: boolean;
  controller: AbortController;
  promise: Promise<CabinetFrame | null>;
  resolve: (frame: CabinetFrame | null) => void;
  started: boolean;
};

/** A small scroll-prioritized frame cache; the full sequence stays on disk. */
export class CabinetFrameCache {
  private readonly frames: string[];
  private readonly canonicalFrames: number[];
  private readonly limit: number;
  private readonly cache = new Map<number, CacheEntry>();
  private readonly pending = new Map<number, FrameJob>();
  private queue: FrameJob[] = [];
  private activeFetches = 0;
  private activeDecodes = 0;
  private decodeWaiters: Array<() => void> = [];
  private clock = 0;
  private paused = false;
  private warmController: AbortController | undefined;
  private readonly warmed = new Set<string>();

  constructor(frames: string[], limit: number) {
    this.frames = frames;
    this.limit = limit;
    const firstForUrl = new Map<string, number>();
    this.canonicalFrames = frames.map((url, index) => {
      const first = firstForUrl.get(url);
      if (first !== undefined) return first;
      firstForUrl.set(url, index);
      return index;
    });
  }

  get(index: number, priority = 0): Promise<CabinetFrame | null> {
    if (this.paused || index < 0 || index >= this.frames.length) return Promise.resolve(null);
    index = this.canonicalFrames[index];
    const hit = this.cache.get(index);
    if (hit) {
      hit.used = ++this.clock;
      return Promise.resolve(hit.image);
    }
    const existing = this.pending.get(index);
    if (existing) {
      if (existing.controller.signal.aborted) {
        this.pending.delete(index);
        existing.resolve(null);
      } else {
      existing.priority = Math.min(existing.priority, priority);
      existing.wanted = true;
      this.sortQueue();
      return existing.promise;
      }
    }
    let resolve!: FrameJob['resolve'];
    const promise = new Promise<CabinetFrame | null>((done) => { resolve = done; });
    const job: FrameJob = { index, priority, wanted: true, controller: new AbortController(), promise, resolve, started: false };
    this.pending.set(index, job);
    this.queue.push(job);
    this.sortQueue();
    this.pump();
    return promise;
  }

  setWindow(center: number, direction: number): Promise<CabinetFrame | null> {
    if (this.paused) return Promise.resolve(null);
    const step = direction >= 0 ? 1 : -1;
    const desired = [center, center + step, center + step * 2, center - step];
    const priorities = new Map(desired.map((index, priority) => [this.canonicalFrames[index], priority]));
    for (const job of [...this.pending.values()]) {
      if (priorities.has(job.index)) {
        job.priority = priorities.get(job.index) ?? job.priority;
        job.wanted = true;
      }
      else if (job.started) { job.priority = 10; job.wanted = false; }
      else {
        this.queue = this.queue.filter((item) => item !== job);
        this.pending.delete(job.index);
        job.resolve(null);
      }
    }
    this.sortQueue();
    const requested = desired.filter((index) => index >= 0 && index < this.frames.length);
    const current = this.get(center, 0);
    requested.slice(1).forEach((index, rank) => { void this.get(index, rank + 1); });
    this.pump();
    return current;
  }

  pause(): void {
    this.paused = true;
    this.warmController?.abort();
    this.warmController = undefined;
    for (const job of this.pending.values()) {
      job.controller.abort();
      job.resolve(null);
    }
    this.pending.clear();
    this.queue = [];
  }

  resume(): void { this.paused = false; }

  /** Fill the browser's compressed-image cache once the scroll story is active. */
  warmHttpCache(): void {
    if (this.paused || this.warmController) return;
    const controller = new AbortController();
    this.warmController = controller;
    const urls = [...new Set(this.frames)].filter((url) => !this.warmed.has(url));
    let cursor = 0;
    const worker = async () => {
      while (!controller.signal.aborted) {
        const url = urls[cursor++];
        if (!url) return;
        try {
          const response = await fetch(url, { signal: controller.signal, cache: 'force-cache' });
          if (!response.ok) continue;
          await response.arrayBuffer();
          this.warmed.add(url);
        } catch {
          if (controller.signal.aborted) return;
        }
      }
    };
    void Promise.all([worker(), worker()]).finally(() => {
      if (this.warmController === controller) this.warmController = undefined;
    });
  }

  clear(): void {
    this.pause();
    for (const entry of this.cache.values()) entry.image.close?.();
    this.cache.clear();
  }

  private sortQueue(): void { this.queue.sort((a, b) => a.priority - b.priority); }

  private pump(): void {
    if (this.paused) return;
    while (this.activeFetches < 4 && this.queue.length) {
      const job = this.queue.shift();
      if (!job || job.controller.signal.aborted) continue;
      job.started = true;
      this.activeFetches += 1;
      void this.load(job).finally(() => {
        this.activeFetches -= 1;
        this.pump();
      });
    }
  }

  private async acquireDecode(): Promise<() => void> {
    if (this.activeDecodes < 2) this.activeDecodes += 1;
    else await new Promise<void>((resolve) => this.decodeWaiters.push(resolve));
    return () => {
      const next = this.decodeWaiters.shift();
      if (next) next();
      else this.activeDecodes -= 1;
    };
  }

  private async decode(blob: Blob): Promise<CabinetFrame> {
    if ('createImageBitmap' in window) return await createImageBitmap(blob) as CabinetFrame;
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image();
      image.decoding = 'async';
      image.src = url;
      await image.decode();
      return image as CabinetFrame;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  private async load(job: FrameJob): Promise<void> {
    let frame: CabinetFrame | null = null;
    try {
      const response = await fetch(this.frames[job.index], { signal: job.controller.signal, cache: 'force-cache' });
      if (!response.ok) throw new Error(`Frame ${job.index}: ${response.status}`);
      const blob = await response.blob();
      if (!job.wanted || job.controller.signal.aborted || this.paused) return;
      const release = await this.acquireDecode();
      try {
        if (!job.wanted || job.controller.signal.aborted || this.paused) throw new Error('Frame request expired');
        frame = await this.decode(blob);
      } finally { release(); }
      if (job.controller.signal.aborted || this.paused) {
        frame.close?.();
        frame = null;
      } else {
        this.cache.set(job.index, { image: frame, used: ++this.clock });
        this.evict();
      }
    } catch {
      frame?.close?.();
      frame = null;
    } finally {
      if (this.pending.get(job.index) === job) this.pending.delete(job.index);
      job.resolve(frame);
    }
  }

  private evict(): void {
    while (this.cache.size > this.limit) {
      let oldestIndex = -1;
      let oldestTime = Infinity;
      for (const [index, entry] of this.cache) {
        if (entry.used < oldestTime) { oldestIndex = index; oldestTime = entry.used; }
      }
      const stale = this.cache.get(oldestIndex);
      stale?.image.close?.();
      this.cache.delete(oldestIndex);
    }
  }
}
