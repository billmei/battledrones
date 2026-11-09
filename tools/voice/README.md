# Recorded voice and sound effects

The game's sound used to be all synthesis: WebAudio recipes for the effects
and the browser's `speechSynthesis` for the radio announcer. Both are now
recordings made with ElevenLabs, with the old synthesis kept as the fallback
(while a file loads, if it fails, and for anything not recorded).

## Announcer voice

- Voice: **Jerry B. — Military Commander | Gruff, Gritty Authority**
  (ElevenLabs voice library, `TxWZERZ5Hc6h9dGxVmXa`), model `eleven_v4`.
- `announcer-lines.ts` lists every line with a fixed wording (414), built from
  the game's own data (unit and building names, sides, calldowns, waves).
- `build-voice.ts` records them 20 to a take (one read, so they sound alike),
  cuts each take apart at its longest silences, trims and evens the loudness,
  and writes `public/assets/voice/<words>.mp3` and `manifest.json`
  (key: `voiceKey(line)`, see `src/game/voice-lines.ts`).
- Not recorded, so still spoken by the browser: an op's title, a wave's name,
  an AI commander's free radio and other lines built from free text.

```sh
export ELEVENLABS_API_KEY=...
npx tsx tools/voice/build-voice.ts generate /tmp/voice   # batch0.mp3 … (about 16k credits)
npx tsx tools/voice/build-voice.ts split /tmp/voice      # → public/assets/voice
```

`tests/recordings.test.ts` fails when a line in `announcer-lines.ts` has no
recording: after rewording a line in `callouts.ts` (and here), re-record. Delete
just the batch files whose lines changed to re-record only those (batches are
20 lines in list order).

## Sound effects

- `tools/sfx/sfx-list.ts`: one text-to-sound prompt per `SfxName`
  (`src/game/audio.ts`) plus the radio's push-to-talk click, the number of
  takes (a random one plays each time), the longest a clip may run, and its
  loudness (matched to the synthesized sound it replaces, so the mix is
  unchanged).
- `build-sfx.ts` records the takes and processes them into
  `public/assets/sfx/` (trim, cap and fade, loudness, mono mp3) with a
  `manifest.json`.

```sh
npx tsx tools/sfx/build-sfx.ts generate /tmp/sfx   # <name>[-n].mp3, about 17 credits each
npx tsx tools/sfx/build-sfx.ts process /tmp/sfx    # → public/assets/sfx
```

Both need `ffmpeg` on the PATH.
