/**
 * The recorded sound effects (public/assets/sfx): one ElevenLabs text-to-sound
 * prompt per SfxName in src/game/audio.ts (plus the announcer's radio click),
 * how many takes were kept (several = a random one each time), and the
 * longest the processed clip may run, in seconds (a fade-out ends anything
 * longer: a gunshot must stay short enough for rapid fire), and how loud it
 * is. See
 * tools/sfx/build-sfx.ts.
 */
export interface SfxSpec {
  prompt: string;
  takes: number;
  max: number;
  /** Loudness, dBFS RMS: matched to the procedural sound it replaces, so the mix stays as it was. */
  level: number;
}

export const SFX: Record<string, SfxSpec> = {
  rifle: { prompt: "Short burst of three rapid assault rifle shots, outdoors, close-mic, dry", takes: 2, max: 0.5, level: -37 },
  snipe: { prompt: "Single powerful sniper rifle shot, sharp crack with a whip-like outdoor echo", takes: 1, max: 0.9, level: -27 },
  crush: { prompt: "Heavy tank tracks crushing sheet metal debris, short grinding crunch and scrape", takes: 1, max: 0.6, level: -31 },
  clank: { prompt: "Heavy metal robot collapsing onto dirt, single clank and thud", takes: 2, max: 0.4, level: -34 },
  thrust: { prompt: "Helicopter rotor downwash gust, short powerful whoosh of wind", takes: 1, max: 0.9, level: -32 },
  cannon: { prompt: "Single tank cannon shot, deep boom with sharp crack, short outdoor tail", takes: 2, max: 0.9, level: -20 },
  heavy: { prompt: "Massive heavy cannon blast, deep powerful boom with ground rumble", takes: 1, max: 1.2, level: -18 },
  mg: { prompt: "Short burst of heavy machine gun fire, five rounds, outdoors", takes: 2, max: 0.35, level: -28 },
  flak: { prompt: "Anti-aircraft autocannon firing two quick thumping rounds", takes: 2, max: 0.6, level: -31 },
  rocket: { prompt: "Shoulder rocket launcher firing, short whoosh of a rocket leaving the tube", takes: 2, max: 1.0, level: -37 },
  missile: { prompt: "Guided missile launching with a sharp hiss and roaring rocket motor, short", takes: 1, max: 1.4, level: -37 },
  laser: { prompt: "Short high-voltage electric arc snap, sharp crackling discharge", takes: 2, max: 0.5, level: -31 },
  shell: { prompt: "Loud mortar launch, a single deep hollow metallic thoomp as the round leaves the tube, outdoors", takes: 2, max: 1.0, level: -17 },
  bomb: { prompt: "Short falling bomb whistle ending in a heavy explosion", takes: 1, max: 1.6, level: -36 },
  explosion: { prompt: "Small explosion, sharp blast with metal debris, short tail", takes: 2, max: 1.6, level: -18 },
  bigExplosion: { prompt: "Huge explosion, powerful blast with deep rumble and falling debris", takes: 2, max: 2.5, level: -17 },
  wreckDrone: { prompt: "Small quadcopter drone shot down: sharp electrical pop and crackle, plastic and metal shattering, rotors whining down, small debris clatter. Short, dry, no music.", takes: 1, max: 1.2, level: -21 },
  wreckAir: { prompt: "Military aircraft hit and exploding in mid-air: loud fiery blast, engine sputtering out, metal tearing apart, debris falling. Short, punchy, no music.", takes: 1, max: 1.6, level: -18 },
  wreckLight: { prompt: "Light armored car destroyed: sharp explosion, metal panels bursting, glass shattering, burning debris clanking on the ground. Short, punchy, no music.", takes: 1, max: 1.2, level: -19 },
  wreckHeavy: { prompt: "Heavy battle tank destroyed: deep booming explosion, ammunition cooking off, thick steel groaning and crashing, heavy debris falling. Short, powerful, no music.", takes: 1, max: 1.8, level: -17 },
  build: { prompt: "Pneumatic impact wrench burst and two metal clanks, short construction work", takes: 1, max: 0.9, level: -28 },
  ready: { prompt: "Heavy mechanical latch locking into place with a short hydraulic hiss", takes: 1, max: 0.8, level: -27 },
  click: { prompt: "Single crisp mechanical toggle switch click", takes: 1, max: 0.15, level: -34 },
  alert: { prompt: "Military base klaxon alarm, two short blasts", takes: 1, max: 1.0, level: -33 },
  heal: { prompt: "Short ratchet wrench turning and a soft welding torch hiss, mechanic repairing metal", takes: 1, max: 0.8, level: -40 },
  rank: { prompt: "Short military snare drum roll ending in a single cymbal crash", takes: 1, max: 1.2, level: -30 },
  sell: { prompt: "Pieces of scrap metal dropped onto a pile, short clatter", takes: 1, max: 0.7, level: -31 },
  victory: { prompt: "Short triumphant military brass fanfare with timpani, three seconds", takes: 1, max: 2.5, level: -28 },
  defeat: { prompt: "Short somber descending military brass phrase with a low drum, three seconds", takes: 1, max: 2.5, level: -28 },
  kill: { prompt: "Metal robot bursting apart, crunch of steel and a shower of sparks, short", takes: 1, max: 0.6, level: -27 },
  lost: { prompt: "Machine motor winding down and dying with a few sparks, short", takes: 1, max: 1.0, level: -27 },
  coin: { prompt: "Single small metal piece dropped into a steel bin, bright clink", takes: 1, max: 0.5, level: -36 },
  inbound: { prompt: "Warship general quarters alarm horn, two rising whoops", takes: 1, max: 1.4, level: -32 },
  deny: { prompt: "Dull muted metal clunk, a jammed lever that won't move", takes: 1, max: 0.4, level: -28 },
  squad: { prompt: "Soldiers' boots landing on gravel with a rattle of gear, short", takes: 1, max: 0.5, level: -33 },
  siren: { prompt: "Air raid siren, one short rising and falling wail, outdoors", takes: 1, max: 2.5, level: -26 },
  emp: { prompt: "Massive high-voltage electrical discharge, loud zap and crackle with a deep thump", takes: 1, max: 1.2, level: -19 },
  pod: { prompt: "Loud heavy steel drop pod crashing into the ground, deep booming impact, metal clang, then dust and debris hiss", takes: 1, max: 1.5, level: -17 },
  hammer: { prompt: "Colossal impact explosion, sharp crack then a long rolling thunderous boom", takes: 1, max: 3, level: -15 },
  charge: { prompt: "Deep rising rumble building in intensity, ground trembling, two seconds", takes: 1, max: 3, level: -33 },
  uplink: { prompt: "Military field radio key click with a short burst of static", takes: 1, max: 0.6, level: -38 },
  capture: { prompt: "Radio dish motor whirring as it locks on, then a clean radio tone, short", takes: 1, max: 1.2, level: -34 },
  uplinkLost: { prompt: "Radio signal breaking up and cutting out into static, short", takes: 1, max: 1.2, level: -35 },
  drop: { prompt: "Cargo plane flying low overhead, propeller drone passing by, three seconds", takes: 1, max: 3, level: -35 },
  crate: { prompt: "Metal supply crate latches popping open and a heavy lid swinging up", takes: 1, max: 1.2, level: -30 },
  anchor: { prompt: "Two heavy steel spikes slammed into the ground, then a long hydraulic hiss", takes: 1, max: 2, level: -20 },
  packup: { prompt: "Burst of steam, heavy locks clanking open one after another, rising hydraulic groan", takes: 1, max: 1.6, level: -29 },
  stomp: { prompt: "Single giant mech footstep, heavy muffled ground thump with a metal creak", takes: 2, max: 0.9, level: -21 },
  topple: { prompt: "Giant steel machine collapsing, long metal groan then a huge crash and rumble", takes: 1, max: 2.5, level: -18 },
  offline: { prompt: "Electrical short circuit sparks crackling and a heavy motor powering down", takes: 1, max: 1.0, level: -30 },
  reboot: { prompt: "Heavy electric motor spinning up to speed, then a mechanical clunk, short", takes: 1, max: 1.2, level: -38 },
  weld: { prompt: "Arc welding buzz and sizzle, short", takes: 1, max: 0.8, level: -40 },
  rollout: { prompt: "Heavy hydraulic clamps releasing with a loud clank, giant engine rumbling to life", takes: 1, max: 1.6, level: -35 },
  hook: { prompt: "Steel cargo hooks locking with a bang, then helicopter rotors straining with a gust", takes: 1, max: 1.4, level: -28 },
  love: { prompt: "Gentle rising music box chime with a soft shimmer, two seconds", takes: 1, max: 2, level: -32 },
  "radio-open": { prompt: "Walkie-talkie push-to-talk button click with a very short squelch", takes: 1, max: 0.35, level: -20 },
  "radio-close": { prompt: "Walkie-talkie button released, short squelch tail of static", takes: 1, max: 0.45, level: -20 }
};
