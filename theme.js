/**
 * Shared by both pages. The <head> of each page sets data-theme inline before
 * paint so a dark-mode user never sees a white flash; this file only owns the
 * toggle button.
 */
const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme
  const button = document.getElementById("theme")
  if (button) button.textContent = theme === "dark" ? "☾" : "☀"
  localStorage.setItem("anpr-theme", theme)
}

applyTheme(document.documentElement.dataset.theme || "light")

document.getElementById("theme")?.addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark")
})
