/**
 * Builds the units' recorded voices (public/assets/units) from
 * tools/voice/unit-lines.ts. See tools/voice/README.md.
 *
 *   npx tsx tools/voice/build-unit-voices.ts prompts          # print each unit's take
 *   npx tsx tools/voice/build-unit-voices.ts generate <dir>   # record them (needs ELEVENLABS_API_KEY)
 *   npx tsx tools/voice/build-unit-voices.ts split <dir>      # cut <dir>/<kind>[-2].mp3 into lines + manifest
 *
 * Two takes per unit class in its own voice (TAKES: <kind>.mp3 holds
 * select, move and attack, <kind>-2.mp3 "ready" and any death cry), cut
 * apart by cut.ts.
 * The manifest files each line's two takes under "<kind>:<line>"
 * (unitVoiceKey in src/game/voices.ts).
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { UnitKind } from "../../src/sim/types";
import { cutTake } from "./cut";
import { TAKES, UNIT_VOICES, takeLines, unitPrompt } from "./unit-lines";

const MODEL_ID = "eleven_v4";
const OUT = fileURLToPath(
  new URL("../../public/assets/units/", import.meta.url),
);
const KINDS = Object.keys(UNIT_VOICES) as UnitKind[];
const takeFile = (k: UnitKind, t: number): string =>
  `${k}${t ? `-${t + 1}` : ""}.mp3`;

function split(dir: string): void {
  mkdirSync(OUT, { recursive: true });
  for (const f of readdirSync(OUT))
    if (f.endsWith(".mp3")) rmSync(join(OUT, f));
  const manifest: Record<string, string[]> = {};
  for (const k of KINDS)
    TAKES.forEach((_, t) => {
      const src = join(dir, takeFile(k, t));
      if (!existsSync(src)) {
        console.warn(`${k}: no ${src}, those lines stay chirps`);
        return;
      }
      const lines = takeLines(k, t);
      const files = lines.flatMap((l) => [
        `${k}-${l}-1.mp3`,
        `${k}-${l}-2.mp3`,
      ]);
      cutTake(
        src,
        files.map((f) => join(OUT, f)),
      );
      lines.forEach(
        (l, i) => (manifest[`${k}:${l}`] = files.slice(i * 2, i * 2 + 2)),
      );
      console.log(`${k} take ${t + 1}: ${files.length} lines`);
    });
  writeFileSync(
    join(OUT, "manifest.json"),
    `${JSON.stringify(manifest, null, 1)}\n`,
  );
}

async function generate(dir: string): Promise<void> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("set ELEVENLABS_API_KEY");
  mkdirSync(dir, { recursive: true });
  for (const k of KINDS)
    for (let t = 0; t < TAKES.length; t++) {
      const file = join(dir, takeFile(k, t));
      if (existsSync(file)) continue;
      const r = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${UNIT_VOICES[k].voice}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: { "xi-api-key": key, "content-type": "application/json" },
          body: JSON.stringify({ text: unitPrompt(k, t), model_id: MODEL_ID }),
        },
      );
      if (!r.ok) throw new Error(`${k}: ${r.status} ${await r.text()}`);
      writeFileSync(file, Buffer.from(await r.arrayBuffer()));
      console.log(`${k} take ${t + 1} recorded`);
    }
}

const [cmd, dir] = process.argv.slice(2);
if (cmd === "prompts")
  for (const k of KINDS)
    TAKES.forEach((_, t) =>
      console.log(
        `${takeFile(k, t)} (${UNIT_VOICES[k].name}): ${unitPrompt(k, t)}`,
      ),
    );
else if (cmd === "split" && dir) split(dir);
else if (cmd === "generate" && dir) void generate(dir);
else {
  console.error(
    "usage: build-unit-voices.ts prompts | generate <dir> | split <dir>",
  );
  process.exit(1);
}
