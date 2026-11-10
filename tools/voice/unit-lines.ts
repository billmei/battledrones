/**
 * The units' recorded voices (public/assets/units): one ElevenLabs library
 * voice per unit class, two takes of each line: select, move and attack
 * (the player's own asks), "ready" when it rolls off the line, and for
 * troops and pilots a death cry. src/game/voices.ts plays one of them
 * instead of the synthesized chirp, which stays as the fallback while a
 * recording loads. Each class was recorded in two takes (TAKES), cut apart
 * by tools/voice/build-unit-voices.ts (see tools/voice/README.md).
 */
import type { UnitKind } from "../../src/sim/types";

export type SpokenLine = "select" | "move" | "attack" | "ready" | "death";
export const SPOKEN_LINES: readonly SpokenLine[] = ["select", "move", "attack", "ready", "death"];
/** What each recorded take holds, in order: take 1 the answers, take 2 the reports. */
export const TAKES: readonly (readonly SpokenLine[])[] = [["select", "move", "attack"], ["ready", "death"]];

export interface UnitVoice {
  /** ElevenLabs library voice id, and its name for the record. */
  voice: string;
  name: string;
  /** Two takes of each line; only troops and pilots have a death cry. */
  lines: Record<Exclude<SpokenLine, "death">, [string, string]> & { death?: [string, string] };
}

export const UNIT_VOICES: Record<UnitKind, UnitVoice> = {
  harvester: {
    voice: "Av4Fi2idMFuA8kTbVZgv", name: "Russel - Old Man Hoarse Voice",
    lines: { select: ["Harvester here.", "Need something?"], move: ["Rolling out.", "On my way."], attack: ["If you say so.", "Here goes nothing."], ready: ["Harvester, ready to work.", "Let's dig."] }
  },
  scout: {
    voice: "Qgg2Tb3UNSkQVZcrV4H0", name: "Kieran - Energetic and Dynamic",
    lines: { select: ["Eyes up!", "Scout ready."], move: ["Going!", "Scouting ahead."], attack: ["I'm unarmed!", "Spotting target."], ready: ["Scout, airborne!", "Eyes in the sky."] }
  },
  stinger: {
    voice: "duTgFVzDLeGav17YDHYo", name: "Ben - Vibrant and High-Energy",
    lines: { select: ["Stinger ready.", "Let's roll!"], move: ["Moving fast!", "Full throttle."], attack: ["Hitting them!", "Light 'em up!"], ready: ["Stinger, rolling!", "Ready to rumble."] }
  },
  "flak-crawler": {
    voice: "MjEQaRiSe6jP1b0vagRU", name: "Fin - energetic, fun Irish character",
    lines: { select: ["Flak here.", "Skies covered."], move: ["Crawling over.", "Moving up."], attack: ["Weapons free!", "Shred 'em!"], ready: ["Flak Crawler, ready.", "Watching the skies."] }
  },
  mortar: {
    voice: "yE92kjHV7JLsMwRaRjeg", name: "The Doc",
    lines: { select: ["Mortar team.", "Coordinates?"], move: ["Relocating.", "Setting up."], attack: ["Fire for effect!", "Shells away!"], ready: ["Mortar team, set.", "Guns primed."] }
  },
  mastodon: {
    voice: "YRJMFMoNhLEYl3Nae0G6", name: "Xavier A Big, Deep & Powerful male voice",
    lines: { select: ["Mastodon.", "Heavy armor ready."], move: ["Rolling heavy.", "Clear the road."], attack: ["Crush them.", "Flatten it!"], ready: ["Mastodon, online.", "Make way."] }
  },
  lancer: {
    voice: "dmWfLQZJq7wNPv9WmtiM", name: "Emma - Wry, Gritty Hero",
    lines: { select: ["Lancer online.", "Beam charged."], move: ["Hovering over.", "On the move."], attack: ["Burning through!", "Lance locked."], ready: ["Lancer, charged and ready.", "Hover drives online."] }
  },
  wasp: {
    voice: "uq0HIbNZKn11Hs5ifEdd", name: "Harry",
    lines: { select: ["Wasp here!", "Ready to sting!"], move: ["Buzzing over.", "Inbound!"], attack: ["Rockets away!", "Strike run!"], ready: ["Wasp, ready to fly!", "Rocket pods loaded."], death: ["Mayday, mayday!", "I'm going down!"] }
  },
  raptor: {
    voice: "WQrm3GCViBYCRcDRlTeP", name: "Colton - Confident and Clear",
    lines: { select: ["Raptor.", "Skies are mine."], move: ["Vectoring.", "Wheels up."], attack: ["Fox two!", "Engaging bandit!"], ready: ["Raptor, wheels up.", "Interceptor ready."], death: ["Ejecting!", "I'm hit, I'm hit!"] }
  },
  hornet: {
    voice: "EaCGZNIZYoLgxVzmLOPI", name: "David - Airline Captain",
    lines: { select: ["Hornet, standing by.", "Bomb bay ready."], move: ["Course set.", "Heading over."], attack: ["Bombs away!", "Carpet incoming."], ready: ["Hornet, airborne.", "Bombs loaded."], death: ["Hornet going down!", "We've lost an engine!"] }
  },
  mender: {
    voice: "s2uzisFuqsY1HHe8wLTA", name: "K",
    lines: { select: ["Mender here.", "Who's hurt?"], move: ["On my way.", "Coming to help."], attack: ["I'm not a fighter.", "Patching up."], ready: ["Mender, ready to help.", "Repair kit ready."] }
  },
  trooper: {
    voice: "GLSWsaquVBsIPLPPRi2s", name: "Admiral Action - Military Man",
    lines: { select: ["Troopers!", "Squad ready."], move: ["Moving out!", "Double time!"], attack: ["Open fire!", "Take 'em down!"], ready: ["Troopers, reporting!", "Squad, locked and loaded."], death: ["Man down!", "Aargh!"] }
  },
  "rocket-squad": {
    voice: "iEvYV2o9zHf3RDl9U51b", name: "Desert Ranger - Male 01",
    lines: { select: ["Rockets ready.", "Got armor?"], move: ["Moving.", "Hauling tubes."], attack: ["Rocket out!", "Hit the armor!"], ready: ["Rocket Squad, ready.", "Tubes loaded."], death: ["We're hit!", "Aargh!"] }
  },
  sniper: {
    voice: "AocjYzHzWRalprWmBG9m", name: "Revenant - RTS Stealth Ghost Soldier Unit",
    lines: { select: ["Sniper team.", "Watching."], move: ["Relocating.", "Finding a perch."], attack: ["Target acquired.", "One shot."], ready: ["Sniper Team, in position.", "Scope's clear."], death: ["They found us!", "Ugh!"] }
  },
  condor: {
    voice: "0F6wBri3KtnolnAMTeIU", name: "Jonathan - Calm & Precise Instructor",
    lines: { select: ["Condor here.", "Ready for pickup."], move: ["Lifting off.", "En route."], attack: ["We're unarmed.", "No guns, Commander."], ready: ["Condor, ready for lift.", "Rotors spinning."], death: ["Condor going down!", "Brace for impact!"] }
  },
  goliath: {
    voice: "QjEdRoRdZC2i3ncmFpNy", name: "Obsidian",
    lines: { select: ["Goliath.", "Awaiting orders."], move: ["Advancing.", "The ground shakes."], attack: ["Annihilate.", "Bring them down."], ready: ["Goliath anchored.", "Systems online."] }
  }
};

/** The lines a unit has in take `t` (TAKES[t]), skipping the ones it doesn't say. */
export const takeLines = (k: UnitKind, t: number): SpokenLine[] => TAKES[t]!.filter((l) => !!UNIT_VOICES[k].lines[l]);
/** Take `t`'s text: two of each of its lines, in order. */
export const unitTakeText = (k: UnitKind, t: number): string[] => takeLines(k, t).flatMap((l) => UNIT_VOICES[k].lines[l]!);
export const unitPrompt = (k: UnitKind, t: number): string => unitTakeText(k, t).join(" [long pause] ");
