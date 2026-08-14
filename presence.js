/**
 * Live presence — who else has this page open, and which listener they are
 * pointed at. Two people firing at the same desktop app produce one interleaved
 * log, which is the actual problem this solves. Clicking someone opens a direct
 * message with them (see chat.js).
 *
 * Entirely optional: with presence.config.js left blank nothing here runs, no
 * network request is made, and the Supabase SDK is never even fetched. That
 * keeps the page usable offline and dependency-free by default.
 *
 * Supabase Realtime Presence is used rather than a table: the state is
 * ephemeral, held in the channel, and cleared automatically when a tab closes —
 * so there is no stale-row cleanup to get wrong.
 */

import { escapeHtml } from "./escape.js"
import { initChat, openChat, unreadFor, unreadTotal } from "./chat.js"

const SDK = "https://esm.sh/@supabase/supabase-js@2"

const el = {
  wrap: document.getElementById("presence"),
  count: document.getElementById("presenceCount"),
  panel: document.getElementById("presencePanel"),
  list: document.getElementById("presenceList"),
  name: document.getElementById("presenceName"),
  share: document.getElementById("presenceShare"),
}

const config = window.PRESENCE_CONFIG ?? {}
const enabled = Boolean(config.url && config.anonKey)

/** Identity is per-browser and self-chosen; there is no account anywhere. */
const myName = () => localStorage.getItem("anpr-name") || ""
const sharing = () => localStorage.getItem("anpr-share") !== "0"

/** Only the host:port is broadcast — never the device id in the path. */
const targetOf = (raw) => {
  try {
    return new URL(raw).host
  } catch {
    return ""
  }
}

if (!enabled) {
  el.wrap?.setAttribute("hidden", "")
} else {
  void start()
}

async function start() {
  /**
   * Stable for the life of this tab and used as the DM address, so it is held
   * here rather than read back off the channel — reaching into channel internals
   * for it was fragile, and the self-filter that depended on it could drop a
   * genuine peer who happened to share a name and target.
   */
  const myKey = crypto.randomUUID()
  let peers = []

  const { createClient } = await import(SDK)
  const client = createClient(config.url, config.anonKey, {
    // No auth, no session to persist — this page never signs anyone in.
    auth: { persistSession: false },
  })

  const me = () => ({
    key: myKey,
    name: myName() || "anonymous",
    target: targetOf(document.getElementById("url")?.value ?? ""),
    at: Date.now(),
  })

  const render = () => {
    el.wrap.hidden = false
    const total = peers.length + (sharing() ? 1 : 0)
    const unread = unreadTotal()
    el.count.textContent = unread ? `${total} · ${unread}` : String(total)
    el.wrap.classList.toggle("live", total > 1)
    el.wrap.classList.toggle("unread", unread > 0)

    el.list.innerHTML = peers.length
      ? peers
          .map((person) => {
            const n = unreadFor(person.key)
            return `<li><button class="p-peer" data-peer="${escapeHtml(person.key)}" data-name="${escapeHtml(
              person.name
            )}"><span class="p-name">${escapeHtml(person.name)}</span><span class="p-target">${escapeHtml(
              person.target || "—"
            )}</span>${n ? `<span class="p-badge">${n}</span>` : ""}</button></li>`
          })
          .join("")
      : `<li class="p-none">${escapeHtml(t("presence.alone"))}</li>`

    el.list.querySelectorAll("[data-peer]").forEach((button) => {
      button.onclick = () => {
        openChat(button.dataset.peer, button.dataset.name)
        el.panel.hidden = true
      }
    })
  }

  const push = () => {
    // Untracking removes the entry for everyone else immediately.
    if (sharing()) void channel.track(me())
    else void channel.untrack()
    render()
  }

  const channel = client.channel(`presence:${config.room ?? "anpr-mock"}`, {
    config: { presence: { key: myKey } },
  })

  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState()
    peers = Object.entries(state)
      // Our own key is the only reliable way to exclude ourselves.
      .filter(([key]) => key !== myKey)
      .flatMap(([, entries]) => entries)
      .filter((entry) => entry.key && entry.name)
    render()
  })

  await channel.subscribe((status) => {
    if (status === "SUBSCRIBED") push()
  })

  // ── wiring ────────────────────────────────────────────────────────────────

  // Language can change after presence has rendered; re-render the list text.
  // Set before initChat, which wraps this hook to re-render the open thread too.
  window.onPresenceLang = render

  initChat({ client, myKey, myName: () => me().name, onUnreadChange: render })

  el.name.value = myName()
  el.share.checked = sharing()
  render()

  el.wrap.querySelector(".p-toggle").onclick = () => {
    el.panel.hidden = !el.panel.hidden
  }
  document.addEventListener("click", (event) => {
    if (!el.wrap.contains(event.target)) el.panel.hidden = true
  })

  el.name.oninput = () => {
    localStorage.setItem("anpr-name", el.name.value.trim())
    push()
  }
  el.share.onchange = () => {
    localStorage.setItem("anpr-share", el.share.checked ? "1" : "0")
    push()
  }

  // Re-announce when the target changes, coalesced so typing does not flood.
  let timer = null
  document.getElementById("url")?.addEventListener("input", () => {
    clearTimeout(timer)
    timer = setTimeout(push, 600)
  })

  window.addEventListener("beforeunload", () => void channel.untrack())
}
