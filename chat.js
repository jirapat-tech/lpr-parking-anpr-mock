/**
 * Direct messages between people shown in the presence list.
 *
 * One Realtime Broadcast channel per pair, named from both session keys sorted,
 * so only those two subscribe. Putting everyone on one channel and filtering by
 * a "to" field would have delivered every message to every browser — readable by
 * anyone who opens devtools, which is not a direct message at all.
 *
 * Messages are transport-only: nothing is stored server-side, so there is no
 * table, no schema and no retention to reason about. Your own view of a
 * conversation is kept in localStorage so a reload does not wipe the thread, but
 * anything sent while your tab was closed is genuinely gone — this coordinates
 * people who are online together, it is not a mailbox.
 *
 * Text only by design: the input carries characters, digits and emoji, and every
 * value is escaped on render, so a message can never inject markup.
 */

import { escapeHtml } from "./escape.js"

const MAX_LEN = 500
/** Stop showing "typing" if no keystroke arrives within this. */
const TYPING_IDLE_MS = 2500
/** Do not broadcast a typing ping more often than this. */
const TYPING_THROTTLE_MS = 900
/** Per-conversation cap; old messages fall off rather than growing forever. */
const KEEP = 200

let ctx = null
/** peerKey → { channel, name } */
const rooms = new Map()
/** peerKey → count */
const unread = new Map()
/** peerKey → timeout handle for clearing the typing flag */
const typingTimers = new Map()

let openPeer = null
let lastTypingSent = 0

const el = {}

export const unreadFor = (peerKey) => unread.get(peerKey) ?? 0
export const unreadTotal = () => [...unread.values()].reduce((sum, n) => sum + n, 0)

// ─── local thread history ──────────────────────────────────────────────────

const historyKey = (peerKey) => `anpr-chat-${peerKey}`

const readThread = (peerKey) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(historyKey(peerKey)) ?? "[]")
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeThread = (peerKey, messages) => {
  try {
    localStorage.setItem(historyKey(peerKey), JSON.stringify(messages.slice(-KEEP)))
  } catch {
    // quota — the thread is disposable
  }
}

// ─── channel per pair ──────────────────────────────────────────────────────

/** Both sides must derive the same name, hence the sort. */
const roomName = (a, b) => `dm:${[a, b].sort().join(":")}`

const roomFor = (peerKey, peerName) => {
  const existing = rooms.get(peerKey)
  if (existing) {
    if (peerName) existing.name = peerName
    return existing
  }

  const channel = ctx.client.channel(roomName(ctx.myKey, peerKey), {
    config: { broadcast: { self: false } },
  })

  channel.on("broadcast", { event: "msg" }, ({ payload }) => {
    if (!payload?.text) return
    const message = { from: "them", name: payload.name ?? "?", text: String(payload.text).slice(0, MAX_LEN), at: Date.now() }
    const thread = [...readThread(peerKey), message]
    writeThread(peerKey, thread)

    clearTyping(peerKey)
    // Count it as unread unless the thread is both open and actually being
    // looked at; still render it so it is already there on returning to the tab.
    if (openPeer !== peerKey || document.visibilityState !== "visible") {
      unread.set(peerKey, unreadFor(peerKey) + 1)
      ctx.onUnreadChange?.()
    }
    if (openPeer === peerKey) renderThread()
  })

  channel.on("broadcast", { event: "typing" }, () => {
    if (openPeer !== peerKey) return
    el.typing.textContent = t("chat.typing", { name: rooms.get(peerKey)?.name ?? "?" })
    clearTimeout(typingTimers.get(peerKey))
    typingTimers.set(peerKey, setTimeout(() => clearTyping(peerKey), TYPING_IDLE_MS))
  })

  void channel.subscribe()

  const room = { channel, name: peerName ?? "?" }
  rooms.set(peerKey, room)
  return room
}

const clearTyping = (peerKey) => {
  clearTimeout(typingTimers.get(peerKey))
  typingTimers.delete(peerKey)
  if (openPeer === peerKey) el.typing.textContent = ""
}

// ─── window ────────────────────────────────────────────────────────────────

export const openChat = (peerKey, peerName) => {
  roomFor(peerKey, peerName)
  openPeer = peerKey
  unread.set(peerKey, 0)
  ctx.onUnreadChange?.()

  el.dock.hidden = false
  el.peer.textContent = peerName ?? "?"
  el.typing.textContent = ""
  renderThread()
  el.input.focus()
}

const closeChat = () => {
  openPeer = null
  el.dock.hidden = true
}

const renderThread = () => {
  if (!openPeer) return
  const thread = readThread(openPeer)
  el.log.innerHTML = thread.length
    ? thread
        .map(
          (m) =>
            `<div class="c-msg ${m.from === "me" ? "mine" : "theirs"}"><span class="c-text">${escapeHtml(
              m.text
            )}</span><span class="c-at">${new Date(m.at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</span></div>`
        )
        .join("")
    : `<p class="c-none">${escapeHtml(t("chat.empty"))}</p>`
  el.log.scrollTop = el.log.scrollHeight
}

const send = () => {
  // Collapse whitespace and cap length; emoji and digits are just characters.
  const text = el.input.value.replace(/\s+/g, " ").trim().slice(0, MAX_LEN)
  if (!text || !openPeer) return

  const room = roomFor(openPeer)
  void room.channel.send({ type: "broadcast", event: "msg", payload: { text, name: ctx.myName() } })

  writeThread(openPeer, [...readThread(openPeer), { from: "me", name: ctx.myName(), text, at: Date.now() }])
  el.input.value = ""
  renderThread()
}

const pingTyping = () => {
  if (!openPeer) return
  const now = Date.now()
  if (now - lastTypingSent < TYPING_THROTTLE_MS) return
  lastTypingSent = now
  void roomFor(openPeer).channel.send({ type: "broadcast", event: "typing", payload: {} })
}

// ─── setup ─────────────────────────────────────────────────────────────────

export const initChat = (context) => {
  ctx = context

  Object.assign(el, {
    dock: document.getElementById("chat"),
    peer: document.getElementById("chatPeer"),
    log: document.getElementById("chatLog"),
    input: document.getElementById("chatInput"),
    typing: document.getElementById("chatTyping"),
    close: document.getElementById("chatClose"),
    send: document.getElementById("chatSend"),
  })
  if (!el.dock) return

  el.input.maxLength = MAX_LEN
  el.close.onclick = closeChat
  el.send.onclick = send
  el.input.onkeydown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      send()
    }
  }
  el.input.oninput = pingTyping

  // Re-render on language change so the empty state follows.
  const previous = window.onPresenceLang
  window.onPresenceLang = () => {
    previous?.()
    if (openPeer) renderThread()
  }
}
