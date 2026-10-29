// No "Transition Guide" tab: the header button is that destination (DESIGN_SPEC rule 7).
export const NAV_LINKS = [
  { href: "/jobs", label: "Jobs" },
  { href: "/resources", label: "Resources" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
] as const;

/** The nav without Resources while /resources has nothing published. */
export function navLinks(showResources: boolean) {
  return showResources ? NAV_LINKS : NAV_LINKS.filter((l) => l.href !== "/resources");
}
