export type NavDirection = "forward" | "back";

export function setNavDirection(direction: NavDirection) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.navDirection = direction;
}
