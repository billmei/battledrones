/**
 * Builds the units' recorded voices (public/assets/units) from
 * tools/voice/unit-lines.ts. See tools/voice/README.md.
 *
 *   npx tsx tools/voice/build-unit-voices.ts prompts          # print each unit's take
 *   npx tsx tools/voice/build-unit-voices.ts generate <dir>   # record them (needs ELEVENLABS_API_KEY)
 *   npx tsx tools/voice/build-unit-voices.ts split <dir>      # cut <dir>/<kind>.mp3 into lines + manifest
 *
 * One take per unit class (its own voice, six lines), cut apart by cut.ts.
 * The manifest files each line's two takes under "<kind>:<line>"
 * (unitVoiceKey in src/game/voices.ts).
 */
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { UnitKind } from "../../src/sim/types";
import { cutTake } from "./cut";
import { SPOKEN_LINES, UNIT_VOICES, unitPrompt } from "./unit-lines";

const MODEL_ID = "eleven_v4";
const OUT = fileURLToPath(new URL("../../public/assets/units/", import.meta.url));
const KINDS = Object.keys(UNIT_VOICES) as UnitKind[];

function split(dir: string): void {
  mkdirSync(OUT, { recursive: true });
  for (const f of readdirSync(OUT)) if (f.endsWith(".mp3")) rmSync(join(OUT, f));
  const manifest: Record<string, string[]> = {};
  for (const k of KINDS) {
    const src = join(dir, `${k}.mp3`);
    if (!existsSync(src)) {
      console.warn(`${k}: no ${src}, it keeps its chirps`);
      continue;
    }
    const files = SPOKEN_LINES.flatMap((l) => [`${k}-${l}-1.mp3`, `${k}-${l}-2.mp3`]);
    cutTake(src, files.map((f) => join(OUT, f)));
    SPOKEN_LINES.forEach((l, i) => (manifest[`${k}:${l}`] = files.slice(i * 2, i * 2 + 2)));
    console.log(`${k}: ${files.length} lines`);
  }
  writeFileSync(join(OUT, "manifest.json"), `${JSON.stringify(manifest, null, 1)}\n`);
}

async function generate(dir: string): Promise<void> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("set ELEVENLABS_API_KEY");
  mkdirSync(dir, { recursive: true });
  for (const k of KINDS) {
    const file = join(dir, `${k}.mp3`);
    if (existsSync(file)) continue;
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${UNIT_VOICES[k].voice}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({ text: unitPrompt(k), model_id: MODEL_ID })
    });
    if (!r.ok) throw new Error(`${k}: ${r.status} ${await r.text()}`);
    writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    console.log(`${k} recorded`);
  }
}

const [cmd, dir] = process.argv.slice(2);
if (cmd === "prompts") for (const k of KINDS) console.log(`${k} (${UNIT_VOICES[k].name}): ${unitPrompt(k)}`);
else if (cmd === "split" && dir) split(dir);
else if (cmd === "generate" && dir) void generate(dir);
else {
  console.error("usage: build-unit-voices.ts prompts | generate <dir> | split <dir>");
  process.exit(1);
}
