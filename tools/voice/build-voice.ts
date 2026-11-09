/**
 * Builds the announcer's recorded voice (public/assets/voice) from
 * tools/voice/announcer-lines.ts. See tools/voice/README.md.
 *
 *   npx tsx tools/voice/build-voice.ts batches            # print the batch prompts (20 lines each)
 *   npx tsx tools/voice/build-voice.ts generate <dir>     # record them (needs ELEVENLABS_API_KEY)
 *   npx tsx tools/voice/build-voice.ts split <dir>        # cut <dir>/batch<N>.mp3 into lines + manifest
 *
 * Each batch is one take of up to 20 lines with "[long pause]" between them
 * (one voice, one read, so the lines sound alike), cut apart at its longest
 * silences. Needs ffmpeg on the PATH.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { announcerLines } from "./announcer-lines";
import { voiceKey } from "../../src/game/voice-lines";

/** The ElevenLabs library voice: "Jerry B. - Military Commander | Gruff, Gritty Authority". */
export const VOICE_ID = "TxWZERZ5Hc6h9dGxVmXa";
export const MODEL_ID = "eleven_v4";
const BATCH = 20;
const OUT = fileURLToPath(new URL("../../public/assets/voice/", import.meta.url));

export function batches(): string[][] {
  const lines = announcerLines();
  const out: string[][] = [];
  for (let i = 0; i < lines.length; i += BATCH) out.push(lines.slice(i, i + BATCH));
  return out;
}

export const prompt = (b: readonly string[]): string => b.map((s) => (/[.!?]$/.test(s) ? s : `${s}.`)).join(" [long pause] ");

/** A file name for a line: its key with dashes ("were out blue wins" → "were-out-blue-wins.mp3"). */
export const fileOf = (line: string): string => `${voiceKey(line).replace(/ /g, "-")}.mp3`;

function parse(log: string): { start: number; end: number }[] {
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

function stderrOf(args: string[]): string {
  return spawnSync("ffmpeg", args, { encoding: "utf8" }).stderr ?? "";
}

function duration(file: string): number {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  return Number(out.trim());
}

function split(dir: string): void {
  const all = batches();
  mkdirSync(OUT, { recursive: true });
  for (const f of readdirSync(OUT)) if (f.endsWith(".mp3")) rmSync(join(OUT, f));
  const manifest: Record<string, string> = {};
  let missing = 0;
  all.forEach((lines, i) => {
    const src = join(dir, `batch${i}.mp3`);
    if (!existsSync(src)) {
      console.warn(`batch ${i}: no ${src}, ${lines.length} lines left to speech`);
      missing += lines.length;
      return;
    }
    // the gaps between lines are the n−1 longest silences (a pause inside a line is shorter)
    const log = stderrOf(["-hide_banner", "-i", src, "-af", "silencedetect=noise=-40dB:d=0.35", "-f", "null", "-"]);
    const gaps = parse(log)
      .filter((s) => s.start > 0.05)
      .sort((a, b) => b.end - b.start - (a.end - a.start))
      .slice(0, lines.length - 1)
      .sort((a, b) => a.start - b.start);
    if (gaps.length !== lines.length - 1) throw new Error(`batch ${i}: ${gaps.length + 1} pieces for ${lines.length} lines`);
    const total = duration(src);
    lines.forEach((line, j) => {
      const pad = 0.06;
      const from = Math.max(0, j === 0 ? 0 : gaps[j - 1]!.end - pad);
      const to = Math.min(total, j === lines.length - 1 ? total : gaps[j]!.start + pad);
      const file = fileOf(line);
      execFileSync("ffmpeg", [
        "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-ss", from.toFixed(3), "-to", to.toFixed(3),
        // trim what silence is left at either end, even out loudness, mono 64 kb/s
        "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=7",
        "-ac", "1", "-ar", "44100", "-b:a", "64k", join(OUT, file)
      ]);
      manifest[voiceKey(line)] = file;
    });
    console.log(`batch ${i}: ${lines.length} lines`);
  });
  writeFileSync(join(OUT, "manifest.json"), `${JSON.stringify(manifest, null, 1)}\n`);
  console.log(`${Object.keys(manifest).length} lines recorded${missing ? `, ${missing} missing` : ""}`);
}

async function generate(dir: string): Promise<void> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("set ELEVENLABS_API_KEY");
  mkdirSync(dir, { recursive: true });
  const all = batches();
  for (let i = 0; i < all.length; i++) {
    const file = join(dir, `batch${i}.mp3`);
    if (existsSync(file)) continue;
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({ text: prompt(all[i]!), model_id: MODEL_ID })
    });
    if (!r.ok) throw new Error(`batch ${i}: ${r.status} ${await r.text()}`);
    writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    console.log(`batch ${i} recorded`);
  }
}

const [cmd, dir] = process.argv.slice(2);
if (cmd === "batches") batches().forEach((b, i) => console.log(`=== batch ${i} (${b.length})\n${prompt(b)}\n`));
else if (cmd === "split" && dir) split(dir);
else if (cmd === "generate" && dir) void generate(dir);
else if (cmd) {
  console.error("usage: build-voice.ts batches | generate <dir> | split <dir>");
  process.exit(1);
}
