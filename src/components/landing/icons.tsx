/** Right arrow used inside CTAs and "See the full sheet" style links. */
export function ArrowRight({ width = 16, height = 12 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 16 12" aria-hidden="true">
      <path
        d="M9.5 1L15 6l-5.5 5M15 6H1"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Diagonal arrow for external links ("View posting"). */
export function ArrowUpRight() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M2 10L10 2M4 2h6v6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
