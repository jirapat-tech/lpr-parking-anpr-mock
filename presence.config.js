/**
 * Presence is OFF until this is filled in — the page works exactly as before
 * with the fields left blank, so nothing here is required to use the tool.
 *
 * To enable: create a Supabase project (free tier) and paste its URL and **anon**
 * key below. Nothing needs switching on — Realtime Presence works out of the box
 * on a public channel, and no database table is involved.
 *
 *   url     → Project Settings → API → Project URL
 *   anonKey → Project Settings → API → Project API keys → anon / public
 *
 * The one setting that WOULD break this: Project Settings → Realtime →
 * "private-only channels". Leave it off, or this channel is rejected.
 *
 * ── READ THIS BEFORE ENABLING ───────────────────────────────────────────────
 * GitHub Pages serves this site publicly even when the repository is private,
 * so anything committed here is public. The anon key is designed to be exposed,
 * but on its own it lets ANYONE who finds this page join the channel and read
 * every name and listener address being broadcast — including internal
 * hostnames and ports.
 *
 * Treat what you broadcast as public. If that is not acceptable, either use a
 * private channel with Supabase auth, or leave presence disabled and keep the
 * page purely local.
 */
window.PRESENCE_CONFIG = {
  url: "",
  anonKey: "",
  /** Everyone on the same room sees each other. Change it to split teams. */
  room: "anpr-mock",
}
