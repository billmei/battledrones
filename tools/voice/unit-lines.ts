/**
 * The units' recorded voices (public/assets/units): one ElevenLabs library
 * voice per unit class, two takes of each line the player asks for (select,
 * move, attack). src/game/voices.ts plays one of them instead of the
 * synthesized chirp, and keeps the chirp for the unprompted lines (ready,
 * promotion, death) and as the fallback. Built by
 * tools/voice/build-unit-voices.ts (see tools/voice/README.md).
 */
import type { UnitKind } from "../../src/sim/types";

export type SpokenLine = "select" | "move" | "attack";
export const SPOKEN_LINES: readonly SpokenLine[] = ["select", "move", "attack"];

export interface UnitVoice {
  /** ElevenLabs library voice id, and its name for the record. */
  voice: string;
  name: string;
  lines: Record<SpokenLine, [string, string]>;
}

export const UNIT_VOICES: Record<UnitKind, UnitVoice> = {
  harvester: {
    voice: "Av4Fi2idMFuA8kTbVZgv", name: "Russel - Old Man Hoarse Voice",
    lines: { select: ["Harvester here.", "Need something?"], move: ["Rolling out.", "On my way."], attack: ["If you say so.", "Here goes nothing."] }
  },
  scout: {
    voice: "Qgg2Tb3UNSkQVZcrV4H0", name: "Kieran - Energetic and Dynamic",
    lines: { select: ["Eyes up!", "Scout ready."], move: ["Going!", "Scouting ahead."], attack: ["I'm unarmed!", "Spotting target."] }
  },
  stinger: {
    voice: "duTgFVzDLeGav17YDHYo", name: "Ben - Vibrant and High-Energy",
    lines: { select: ["Stinger ready.", "Let's roll!"], move: ["Moving fast!", "Full throttle."], attack: ["Hitting them!", "Light 'em up!"] }
  },
  "flak-crawler": {
    voice: "MjEQaRiSe6jP1b0vagRU", name: "Fin - energetic, fun Irish character",
    lines: { select: ["Flak here.", "Skies covered."], move: ["Crawling over.", "Moving up."], attack: ["Weapons free!", "Shred 'em!"] }
  },
  mortar: {
    voice: "yE92kjHV7JLsMwRaRjeg", name: "The Doc",
    lines: { select: ["Mortar team.", "Coordinates?"], move: ["Relocating.", "Setting up."], attack: ["Fire for effect!", "Shells away!"] }
  },
  mastodon: {
    voice: "YRJMFMoNhLEYl3Nae0G6", name: "Xavier A Big, Deep & Powerful male voice",
    lines: { select: ["Mastodon.", "Heavy armor ready."], move: ["Rolling heavy.", "Clear the road."], attack: ["Crush them.", "Flatten it!"] }
  },
  lancer: {
    voice: "dmWfLQZJq7wNPv9WmtiM", name: "Emma - Wry, Gritty Hero",
    lines: { select: ["Lancer online.", "Beam charged."], move: ["Hovering over.", "On the move."], attack: ["Burning through!", "Lance locked."] }
  },
  wasp: {
    voice: "uq0HIbNZKn11Hs5ifEdd", name: "Harry",
    lines: { select: ["Wasp here!", "Ready to sting!"], move: ["Buzzing over.", "Inbound!"], attack: ["Rockets away!", "Strike run!"] }
  },
  raptor: {
    voice: "WQrm3GCViBYCRcDRlTeP", name: "Colton - Confident and Clear",
    lines: { select: ["Raptor.", "Skies are mine."], move: ["Vectoring.", "Wheels up."], attack: ["Fox two!", "Engaging bandit!"] }
  },
  hornet: {
    voice: "EaCGZNIZYoLgxVzmLOPI", name: "David - Airline Captain",
    lines: { select: ["Hornet, standing by.", "Bomb bay ready."], move: ["Course set.", "Heading over."], attack: ["Bombs away!", "Carpet incoming."] }
  },
  mender: {
    voice: "s2uzisFuqsY1HHe8wLTA", name: "K",
    lines: { select: ["Mender here.", "Who's hurt?"], move: ["On my way.", "Coming to help."], attack: ["I'm not a fighter.", "Patching up."] }
  },
  trooper: {
    voice: "GLSWsaquVBsIPLPPRi2s", name: "Admiral Action - Military Man",
    lines: { select: ["Troopers!", "Squad ready."], move: ["Moving out!", "Double time!"], attack: ["Open fire!", "Take 'em down!"] }
  },
  "rocket-squad": {
    voice: "iEvYV2o9zHf3RDl9U51b", name: "Desert Ranger - Male 01",
    lines: { select: ["Rockets ready.", "Got armor?"], move: ["Moving.", "Hauling tubes."], attack: ["Rocket out!", "Hit the armor!"] }
  },
  sniper: {
    voice: "AocjYzHzWRalprWmBG9m", name: "Revenant - RTS Stealth Ghost Soldier Unit",
    lines: { select: ["Sniper team.", "Watching."], move: ["Relocating.", "Finding a perch."], attack: ["Target acquired.", "One shot."] }
  },
  condor: {
    voice: "0F6wBri3KtnolnAMTeIU", name: "Jonathan - Calm & Precise Instructor",
    lines: { select: ["Condor here.", "Ready for pickup."], move: ["Lifting off.", "En route."], attack: ["We're unarmed.", "No guns, Commander."] }
  },
  goliath: {
    voice: "QjEdRoRdZC2i3ncmFpNy", name: "Obsidian",
    lines: { select: ["Goliath.", "Awaiting orders."], move: ["Advancing.", "The ground shakes."], attack: ["Annihilate.", "Bring them down."] }
  }
};

/** One take per unit: its six lines in order (select, move, attack; two each). */
export const unitTakeLines = (k: UnitKind): string[] => SPOKEN_LINES.flatMap((l) => UNIT_VOICES[k].lines[l]);
export const unitPrompt = (k: UnitKind): string => unitTakeLines(k).join(" [long pause] ");
