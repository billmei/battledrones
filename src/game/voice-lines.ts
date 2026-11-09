/**
 * The announcer's recorded voice (public/assets/voice): every line with a
 * fixed wording (tools/voice/announcer-lines.ts) recorded with an ElevenLabs
 * library voice, filed under voiceKey(text). announcer.ts plays a recording
 * when there is one and falls back to the browser's speechSynthesis for the
 * rest (an op's title, a wave's name, an AI commander's free radio).
 */
import { SampleBank } from "./samples";

/** The key a line is filed under: lower case, letters and digits, single spaces ("We're out!" → "were out"). */
export function voiceKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export const voiceLines = new SampleBank("assets/voice/");

/** Lines worth having decoded before they are first needed (the rest load on first use). */
export const PRELOAD_LINES = [
  "Radio check", "Warning: our HQ is under attack", "Our base is under attack", "Our units are under fire",
  "Enemy aircraft detected", "Construction complete", "Insufficient scrap", "Cannot build there",
  "First blood", "Double kill", "Triple kill", "Rampage", "Squad lost", "Harvester lost",
  "Incoming artillery!", "EMP inbound!", "Enemy drop pod!", "Supply drop inbound", "Uplink captured", "Uplink lost",
  "Troops deployed", "Enemy troops landing!", "Sky Hammer online", "Enemy Sky Hammer inbound!"
].map(voiceKey);
