/**
 * Where online play (two-player duels and four-player battles) meets: the relay's WebSocket URL, or "" for none.
 *
 * Set at build time by the RELAY_URL environment variable (vite.config.ts defines __RELAY_URL__; the Pages
 * workflow passes the repository variable RELAY_URL). Unset or empty, the build has no online play: the menu
 * hides its online button and ignores online invite links. The relay only admits pages from the origins it
 * lists (relay/server.py), so a fork turns this on once it runs a relay of its own.
 *
 * Outside a Vite build (the tests) the define is absent and the upstream relay stands, as before.
 */
declare const __RELAY_URL__: string | undefined;

/** The upstream deployment (relay/fly.toml). */
const UPSTREAM_RELAY_URL = "wss://battledrones-relay.fly.dev";

export const RELAY_URL: string = typeof __RELAY_URL__ === "undefined" ? UPSTREAM_RELAY_URL : __RELAY_URL__.replace(/\/+$/, "");

/** This build can play online. */
export const ONLINE_PLAY = RELAY_URL !== "";
