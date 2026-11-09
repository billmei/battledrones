/**
 * Recorded sounds (public/assets/sfx, public/assets/voice): a manifest maps a
 * key to one or more files, fetched and decoded on demand into AudioBuffers.
 * Nothing here plays anything: audio.ts plays the sound effects and
 * announcer.ts the voice lines, each keeping its procedural / speech version
 * as the fallback while a file loads, when it fails, or when there is none.
 */

/** manifest.json: key → file name(s), relative to the bank's folder. */
export type SampleManifest = Record<string, string | string[]>;

export class SampleBank {
  private files: Record<string, string[]> | null = null;
  private manifestLoad: Promise<void> | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private loads = new Map<string, Promise<AudioBuffer | null>>();
  private failed = new Set<string>();

  /** `base`: the bank's folder URL, ending in "/" (relative to the page, like the game's other assets). */
  constructor(readonly base: string) {}

  /** Fetch the manifest (once). Resolves either way; a bank without one just has nothing. */
  init(): Promise<void> {
    if (this.manifestLoad) return this.manifestLoad;
    this.manifestLoad = (async () => {
      if (typeof fetch !== "function" || typeof window === "undefined") return;
      try {
        const r = await fetch(`${this.base}manifest.json`);
        if (!r.ok) return;
        const m = (await r.json()) as SampleManifest;
        const files: Record<string, string[]> = {};
        for (const [k, v] of Object.entries(m)) files[k] = Array.isArray(v) ? v : [v];
        this.files = files;
      } catch {
        /* no recordings: everything falls back */
      }
    })();
    return this.manifestLoad;
  }

  /** Is there a recording for `key` (once the manifest is in)? */
  has(key: string): boolean {
    return !!this.files?.[key]?.some((f) => !this.failed.has(f));
  }

  /** A decoded recording for `key` (a random take when there are several), or null if none is loaded yet. */
  ready(key: string): AudioBuffer | null {
    const fs = this.files?.[key];
    if (!fs) return null;
    const loaded = fs.map((f) => this.buffers.get(f)).filter((b): b is AudioBuffer => !!b);
    return loaded.length ? loaded[Math.floor(Math.random() * loaded.length)]! : null;
  }

  /** Load every take of `key`; resolves with one of them (null if none could be loaded). */
  async load(ctx: BaseAudioContext, key: string): Promise<AudioBuffer | null> {
    await this.init();
    const fs = this.files?.[key];
    if (!fs) return null;
    await Promise.all(fs.map((f) => this.file(ctx, f)));
    return this.ready(key);
  }

  /** Load these keys (all of them when omitted) in the background, a few at a time. */
  async preload(ctx: BaseAudioContext, keys?: readonly string[], parallel = 4): Promise<void> {
    await this.init();
    if (!this.files) return;
    const queue = (keys ?? Object.keys(this.files)).flatMap((k) => this.files![k] ?? []);
    const worker = async () => {
      for (let f = queue.shift(); f !== undefined; f = queue.shift()) await this.file(ctx, f);
    };
    await Promise.all(Array.from({ length: parallel }, worker));
  }

  private file(ctx: BaseAudioContext, f: string): Promise<AudioBuffer | null> {
    const have = this.buffers.get(f);
    if (have) return Promise.resolve(have);
    if (this.failed.has(f)) return Promise.resolve(null);
    let p = this.loads.get(f);
    if (!p) {
      p = (async () => {
        try {
          const r = await fetch(`${this.base}${f}`);
          if (!r.ok) throw new Error(`${r.status}`);
          const data = await r.arrayBuffer();
          // (the callback form: older Safari has no promise-returning decodeAudioData)
          const buf = await new Promise<AudioBuffer>((ok, bad) => ctx.decodeAudioData(data, ok, bad));
          this.buffers.set(f, buf);
          return buf;
        } catch {
          this.failed.add(f);
          return null;
        } finally {
          this.loads.delete(f);
        }
      })();
      this.loads.set(f, p);
    }
    return p;
  }
}
