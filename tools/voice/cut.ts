/**
 * Cutting one recorded take of several lines (read with "[long pause]"
 * between them) into one clip per line: the gaps are the take's n−1 longest
 * silences, since a pause inside a line is shorter. Each clip is trimmed of
 * the silence left at either end, evened out in loudness and written as
 * mono 64 kb/s mp3. Needs ffmpeg and ffprobe on the PATH.
 */
import { execFileSync, spawnSync } from "node:child_process";

function silences(src: string): { start: number; end: number }[] {
  const log = spawnSync("ffmpeg", ["-hide_banner", "-i", src, "-af", "silencedetect=noise=-40dB:d=0.35", "-f", "null", "-"], { encoding: "utf8" }).stderr ?? "";
  const out: { start: number; end: number }[] = [];
  let start: number | null = null;
  for (const m of log.matchAll(/silence_(start|end): ([\d.]+)/g)) {
    const t = Number(m[2]);
    if (m[1] === "start") start = t;
    else if (start !== null) {
      out.push({ start, end: t });
      start = null;
    }
  }
  return out;
}

function duration(file: string): number {
  return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }).trim());
}

/** Cut `src` into `outs.length` clips, one per line in order. Throws when the take doesn't split into that many. */
export function cutTake(src: string, outs: readonly string[]): void {
  const n = outs.length;
  const gaps = silences(src)
    .filter((s) => s.start > 0.05)
    .sort((a, b) => b.end - b.start - (a.end - a.start))
    .slice(0, n - 1)
    .sort((a, b) => a.start - b.start);
  if (gaps.length !== n - 1) throw new Error(`${src}: ${gaps.length + 1} pieces for ${n} lines`);
  const total = duration(src);
  const pad = 0.06;
  outs.forEach((out, j) => {
    const from = Math.max(0, j === 0 ? 0 : gaps[j - 1]!.end - pad);
    const to = Math.min(total, j === n - 1 ? total : gaps[j]!.start + pad);
    execFileSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-ss", from.toFixed(3), "-to", to.toFixed(3),
      "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=7",
      "-ac", "1", "-ar", "44100", "-b:a", "64k", out
    ]);
  });
}
