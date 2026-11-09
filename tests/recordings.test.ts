import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { voiceKey } from "../src/game/voice-lines";
import { announcerLines } from "../tools/voice/announcer-lines";
import { SFX } from "../tools/sfx/sfx-list";

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
});
