/**
 * LIFT Tailux switches to dark by a `.dark` class on the root element, while the
 * rest of the app follows `prefers-color-scheme`. Mirror the media query onto the
 * class so both halves of the page agree.
 */
export function syncColorScheme(): void {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => document.documentElement.classList.toggle("dark", query.matches);
  apply();
  query.addEventListener("change", apply);
}
