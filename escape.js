/**
 * Shared by presence.js and chat.js. Its own module because those two import
 * each other, and a value exported from a partially-evaluated module is still in
 * its temporal dead zone — a cycle that happens to work today only because
 * nothing calls this at module scope.
 */
export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])
