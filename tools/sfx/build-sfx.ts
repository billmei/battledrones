/**
 * Builds the recorded sound effects (public/assets/sfx) from the takes of
 * tools/sfx/sfx-list.ts. See tools/voice/README.md.
 *
 *   npx tsx tools/sfx/build-sfx.ts generate <dir>   # record every take (needs ELEVENLABS_API_KEY)
 *   npx tsx tools/sfx/build-sfx.ts process <dir>    # <dir>/<name>[-n].mp3 → public/assets/sfx + manifest
 *
 * Processing trims the silence in front, caps the length (fading out the
 * end), sets the loudness (the list's level, peaks under −1 dBFS), and
 * writes mono 96 kb/s mp3. Needs ffmpeg on the PATH.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { SFX } from "./sfx-list";

const OUT = fileURLToPath(new URL("../../public/assets/sfx/", import.meta.url));
const PEAK = -1;

const takesOf = (name: string): string[] => Array.from({ length: SFX[name]!.takes }, (_, i) => (i ? `${name}-${i}` : name));

function levels(file: string, filter: string): { mean: number; max: number } {
  const log = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", `${filter},volumedetect`, "-f", "null", "-"], { encoding: "utf8" }).stderr ?? "";
  const mean = Number(/mean_volume: (-?[\d.]+) dB/.exec(log)?.[1]);
  const max = Number(/max_volume: (-?[\d.]+) dB/.exec(log)?.[1]);
  return { mean, max };
}

function process_(dir: string): void {
  mkdirSync(OUT, { recursive: true });
  for (const f of readdirSync(OUT)) if (f.endsWith(".mp3")) rmSync(join(OUT, f));
  const manifest: Record<string, string | string[]> = {};
  for (const [name, spec] of Object.entries(SFX)) {
    const files: string[] = [];
    for (const take of takesOf(name)) {
      const src = join(dir, `${take}.mp3`);
      if (!existsSync(src)) {
        console.warn(`${take}: no ${src}`);
        continue;
      }
      const fade = Math.min(0.25, spec.max * 0.35);
      const shape = [
        "silenceremove=start_periods=1:start_threshold=-50dB",
        `atrim=0:${spec.max}`,
        `afade=t=out:st=${(spec.max - fade).toFixed(3)}:d=${fade.toFixed(3)}`,
        // trim a silent tail the cap left
        "areverse,silenceremove=start_periods=1:start_threshold=-55dB,areverse"
      ].join(",");
      const { mean, max } = levels(src, shape);
      const gain = Math.min(spec.level - mean, PEAK - max);
      const file = `${take}.mp3`;
      execFileSync("ffmpeg", [
        "-hide_banner", "-loglevel", "error", "-y", "-i", src,
        "-af", `${shape},volume=${gain.toFixed(2)}dB`,
        "-ac", "1", "-ar", "44100", "-b:a", "96k", join(OUT, file)
      ]);
      files.push(file);
    }
    if (files.length) manifest[name] = files.length === 1 ? files[0]! : files;
  }
  writeFileSync(join(OUT, "manifest.json"), `${JSON.stringify(manifest, null, 1)}\n`);
  console.log(`${Object.keys(manifest).length} sounds`);
}

async function generate(dir: string): Promise<void> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("set ELEVENLABS_API_KEY");
  mkdirSync(dir, { recursive: true });
  for (const [name, spec] of Object.entries(SFX)) {
    for (const take of takesOf(name)) {
      const file = join(dir, `${take}.mp3`);
      if (existsSync(file)) continue;
      const r = await fetch("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128", {
        method: "POST",
        headers: { "xi-api-key": key, "content-type": "application/json" },
        body: JSON.stringify({ text: spec.prompt, model_id: "eleven_text_to_sound_v2", prompt_influence: 0.3 })
      });
      if (!r.ok) throw new Error(`${take}: ${r.status} ${await r.text()}`);
      writeFileSync(file, Buffer.from(await r.arrayBuffer()));
      console.log(`${take} recorded`);
    }
  }
}

const [cmd, dir] = process.argv.slice(2);
if (cmd === "process" && dir) process_(dir);
else if (cmd === "generate" && dir) void generate(dir);
else {
  console.error("usage: build-sfx.ts generate <dir> | process <dir>");
  process.exit(1);
}
