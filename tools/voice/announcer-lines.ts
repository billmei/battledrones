/**
 * Every line the radio announcer can say that has a fixed wording, built from
 * the same data the game uses (unit and building names, sides, calldowns).
 * tools/voice/build-voice.ts records each one with the ElevenLabs announcer
 * voice into public/assets/voice/, and src/game/voice-lines.ts plays the
 * recording instead of the browser's speech. Anything not listed here (an op's
 * title, a wave's name, an AI commander's free radio) still falls back to
 * speechSynthesis, so a missing line is never silent.
 *
 * Keep this in step with the wording in src/game/callouts.ts, announce()
 * callers and finale.ts: a changed line just falls back to speech until the
 * voice is rebuilt (see tools/voice/README.md).
 */
import { BUILDINGS, UNITS } from "../../src/sim/balance";
import { POWER_NAMES } from "../../src/sim/powers";
import type { PowerKind, UnitKind } from "../../src/sim/types";
import { speakable } from "../../src/game/callouts";
import { voiceKey } from "../../src/game/voice-lines";

const SIDES = ["Blue", "Red", "Green", "Purple"];
const POWERS = Object.keys(POWER_NAMES) as PowerKind[];
const powerName = (p: PowerKind) => POWER_NAMES[p];
const powerPhrase = (p: PowerKind) => (p === "hammer" ? "the Sky Hammer" : p === "emp" ? "an EMP" : `a ${POWER_NAMES[p]}`);
const SHORT: Partial<Record<UnitKind, string>> = { "flak-crawler": "Flak" };
/** Units big enough for a kill banner or a loss line (CALLOUTS.bigKillValue / bigLossValue: 350). */
const BIG = 350;

export function announcerLines(): string[] {
  const out = new Set<string>();
  const add = (...xs: string[]) => xs.forEach((x) => out.add(x));
  const units = (Object.keys(UNITS) as UnitKind[]).filter((k) => k !== "goliath");
  const buildings = Object.values(BUILDINGS).map((b) => b.name);

  // --- fixed lines (callouts.ts) ---
  add(
    "Radio check",
    "Rampage", "Triple kill", "Double kill", "First blood",
    "Insufficient scrap", "Cannot build there",
    "Warning: our HQ is under attack", "Our base is under attack", "Our units are under fire", "Our Goliath is under attack",
    "Direct hit!", "Our HQ has fallen", "Enemy HQ destroyed", "Goliath lost", "Goliath lost in the drop",
    "Squad lost", "Harvester lost", "Construction complete",
    "Incoming artillery!", "EMP inbound!", "Enemy drop pod!",
    "Condor down with a squad aboard", "Condor down with 2 squads aboard", "Condor down with 3 squads aboard",
    "Replacement Condor inbound", "Replacement Condor inbound, a squad aboard",
    "Condor down! Troops bailing out", "Troops deployed", "Enemy troops landing!",
    "Enemy Goliath in production", "Enemy Goliath nearly complete", "Goliath ready", "Enemy Goliath on the field",
    "Goliath anchored", "Enemy Goliath digging in", "Enemy Goliath packing up",
    "Goliath airborne", "Goliath dropped!", "Enemy Goliath airborne", "Enemy Goliath dropped!",
    "Enemy aircraft detected", "We're out of the fight",
    "They fell in love. The battle is a draw.", "The battle is a draw.",
    "Base overrun. The last Goliath has fallen.", "Base overrun. The HQ has fallen.",
    "Last rival knocked out. Victory!",
    "Last enemy Goliath destroyed. Victory!", "Enemy HQ destroyed. Victory!",
    "Our last Goliath has fallen. Mission failed.", "Our HQ has fallen. Mission failed.",
    "Goliath down", "Elite Goliath down", "Enemy Goliath destroyed", "Enemy Elite Goliath destroyed"
  );
  // --- other banners (read out through speakable()) ---
  add(
    "Salvage haul", "Uplink captured", "Uplink lost", "Rare supply drop!", "Supply drop inbound",
    "Sky Hammer online", "Sky Hammer inbound!", "Enemy Sky Hammer inbound!",
    "Op failed", "Op complete", "One minute to hold", "One minute left", "New record!", "Mutators active",
    "Base overrun", "Last rival knocked out", "We're out", "Both resigned", "Your friend resigned", "You resigned",
    "They fell in love. It's a draw.", "Enemy Goliath destroyed", "Our last Goliath has fallen",
    "Blue resigned", "Red resigned"
  );
  for (let w = 1; w <= 30; w++) add(w % 10 === 0 ? `Wave ${w} cleared!` : `Wave ${w} cleared`);
  // raids (awareness.ts raidAdvice)
  for (const what of ["Goliath", "Lancers", "Mastodons", "artillery", "bombers", "drones", "dropships", "rocket troops", "snipers", "strike force", "tanks", "troops"])
    add(`Enemy ${what} inbound`);

  // --- streaks named for a calldown ---
  for (const p of POWERS)
    for (const t of ["Rampage", "Triple kill", "Double kill"]) add(`${powerName(p)}: ${t.toLowerCase()}`);
  for (const p of POWERS) add(`Enemy HQ destroyed by ${powerPhrase(p)}`, `Enemy Goliath destroyed by ${powerPhrase(p)}`, `Enemy Elite Goliath destroyed by ${powerPhrase(p)}`);

  // --- per unit ---
  for (const k of units) {
    const u = UNITS[k];
    const name = u.name;
    add(`${name} promoted`, `${name} promoted to elite`);
    if (k !== "harvester") add(`Veteran ${name} lost`);
    if (u.cost >= BIG) add(`${name} lost`);
    // big kills (value ≥ 350 or an elite)
    const labels = [`Elite ${SHORT[k] ?? name}`, ...(u.cost >= BIG ? [SHORT[k] ?? name] : [])];
    for (const label of labels) {
      add(`Enemy ${label} destroyed`);
      for (const p of POWERS) add(`Enemy ${label} destroyed by ${powerPhrase(p)}`);
    }
  }

  // --- per building ---
  for (const b of buildings) add(`Structure lost: ${b}`, `Enemy ${b} destroyed`);

  // --- Goliath weapon systems ---
  const systems = ["mortars", "laser", "cannons", "mortars and laser", "mortars and cannons", "laser and cannons", "mortars, laser and cannons"];
  for (const w of systems) add(`Goliath ${w} offline`, `Goliath ${w} back online`, `Enemy Goliath: ${w} down!`, `Enemy Goliath ${w} back online`);

  // --- sides (free-for-alls and watching a match) ---
  for (const s of SIDES) {
    add(
      `${s} knocked out`, `${s} HQ under attack`, `${s} Goliath under attack`, `${s} HQ destroyed`,
      `${s} troops landing`, `${s} Goliath in production`, `${s} Goliath nearly complete`, `${s} Goliath on the field`,
      `${s} Goliath digging in`, `${s} Goliath airborne`, `${s} Goliath dropped!`, `${s} aircraft inbound`,
      `First blood to ${s}`, `${s} wins the battle`, `${s} wins the battle.`, `We're out. ${s} wins the battle.`,
      `${s} takes the field`, `${s} takes an Uplink`, `${s} Goliath down`, `${s} Elite Goliath down`);
    for (const t of ["Rampage", "Triple kill", "Double kill"]) add(`${t} for ${s}`);
  }
  // a watched duel's ending names both sides
  for (const [l, w] of [["Red", "Blue"], ["Blue", "Red"]] as const) add(`${l}'s last Goliath destroyed. ${w} wins the battle`);

  // one recording per key: "Wave 10 cleared!" and "Wave 10 cleared" share theirs
  const seen = new Set<string>();
  return [...out].map((s) => speakable(s)).filter((s) => {
    const k = voiceKey(s);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
