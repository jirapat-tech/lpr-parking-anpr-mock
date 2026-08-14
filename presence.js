/**
 * Live presence — who else has this page open, and which listener they are
 * pointed at. Two people firing at the same desktop app produce one interleaved
 * log, which is the actual problem this solves.
 *
 * Entirely optional: with presence.config.js left blank nothing here runs, no
 * network request is made, and the Supabase SDK is never even fetched. That
 * keeps the page usable offline and dependency-free by default.
 *
 * Supabase Realtime Presence is used rather than a table: the state is
 * ephemeral, held in the channel, and cleared automatically when a tab closes —
 * so there is no stale-row cleanup to get wrong.
 */

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
  let channel
  let others = []

  const { createClient } = await import(SDK)
  const client = createClient(config.url, config.anonKey, {
    // No auth, no session to persist — this page never signs anyone in.
    auth: { persistSession: false },
  })

  const me = () => ({
    name: myName() || "anonymous",
    target: targetOf(document.getElementById("url")?.value ?? ""),
    at: Date.now(),
  })

  const render = () => {
    el.wrap.hidden = false
    const total = others.length + (sharing() ? 1 : 0)
    el.count.textContent = String(total)
    el.wrap.classList.toggle("live", total > 1)

    el.list.innerHTML = others.length
      ? others
          .map(
            (person) =>
              `<li><span class="p-name">${escapeHtml(person.name)}</span><span class="p-target">${escapeHtml(
                person.target || "—"
              )}</span></li>`
          )
          .join("")
      : `<li class="p-none">${escapeHtml(t("presence.alone"))}</li>`
  }

  const push = () => {
    if (!channel) return
    // Untracking removes the entry for everyone else immediately.
    if (sharing()) void channel.track(me())
    else void channel.untrack()
    render()
  }

  channel = client.channel(`presence:${config.room ?? "anpr-mock"}`, {
    config: { presence: { key: crypto.randomUUID() } },
  })

  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState()
    others = Object.entries(state)
      .filter(([key]) => key !== channel.params?.config?.presence?.key)
      .flatMap(([, entries]) => entries)
      .filter((entry) => entry.at && entry.name)
    // The channel echoes our own entry back; drop it by identity, not by key,
    // so a reconnect under a new key does not show us to ourselves.
    const mine = me()
    let skipped = false
    others = others.filter((person) => {
      if (!skipped && person.name === mine.name && person.target === mine.target) {
        skipped = true
        return false
      }
      return true
    })
    render()
  })

  await channel.subscribe((status) => {
    if (status === "SUBSCRIBED") push()
  })

  // ── wiring ────────────────────────────────────────────────────────────────

  // Language can change after presence has rendered; re-render the list text.
  window.onPresenceLang = render

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

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]
  )
}
