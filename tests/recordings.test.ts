import { describe, expect, it } from "vitest";
import { voiceKey } from "../src/game/voice-lines";
import { announcerLines } from "../tools/voice/announcer-lines";
import { SFX } from "../tools/sfx/sfx-list";
import { SPOKEN_LINES, UNIT_VOICES } from "../tools/voice/unit-lines";
import { unitVoiceKey } from "../src/game/voices";
import type { UnitKind } from "../src/sim/types";

// (node:fs without Node's type declarations: the project only types the browser)
const { existsSync, readFileSync }: { existsSync(path: string): boolean; readFileSync(path: string, enc: "utf8"): string } =
  await import(/* @vite-ignore */ ["node", "fs"].join(":"));

const manifest = (dir: string): Record<string, string | string[]> =>
  JSON.parse(readFileSync(`public/assets/${dir}/manifest.json`, "utf8")) as Record<string, string | string[]>;
const files = (v: string | string[]) => (Array.isArray(v) ? v : [v]);

describe("recorded audio", () => {
  it("files a line under its words alone", () => {
    expect(voiceKey("We're out!")).toBe("were out");
    expect(voiceKey("Warning: our HQ is under attack")).toBe("warning our hq is under attack");
    expect(voiceKey("Enemy Goliath: mortars, laser and cannons down!")).toBe("enemy goliath mortars laser and cannons down");
  });

  it("has a recording of every fixed announcer line, and every file the voice manifest names", () => {
    const m = manifest("voice");
    const missing = announcerLines().filter((l) => !m[voiceKey(l)]);
    // a reworded line falls back to speech: rebuild the voice (tools/voice/README.md)
    expect(missing).toEqual([]);
    for (const v of Object.values(m)) for (const f of files(v)) expect(existsSync(`public/assets/voice/${f}`), f).toBe(true);
  });

  it("has every sound effect, with every take the manifest names", () => {
    const m = manifest("sfx");
    expect(Object.keys(m).sort()).toEqual(Object.keys(SFX).sort());
    for (const v of Object.values(m)) for (const f of files(v)) expect(existsSync(`public/assets/sfx/${f}`), f).toBe(true);
  });

  it("has every unit class's recorded lines: two takes of select, move, attack and ready (and of a pilot's or a soldier's death cry)", () => {
    const m = manifest("units");
    for (const k of Object.keys(UNIT_VOICES) as UnitKind[])
      for (const l of SPOKEN_LINES) {
        if (l === "death" && !UNIT_VOICES[k].lines.death) {
          // (a vehicle dies with its wreck sound, not a word)
          expect(m[unitVoiceKey(k, l)], `${k} ${l}`).toBeUndefined();
          continue;
        }
        const fs = files(m[unitVoiceKey(k, l)] ?? []);
        expect(fs.length, `${k} ${l}`).toBe(2);
        for (const f of fs) expect(existsSync(`public/assets/units/${f}`), f).toBe(true);
      }
  });
});
