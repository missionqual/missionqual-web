// Icons from design/community/*.html. All decorative.
type P = { size?: number };

const stroke = (size: number, width: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: width,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const CheckIcon = ({ size = 14 }: P) => (
  <svg {...stroke(size, 3)}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const PlusIcon = ({ size = 16 }: P) => (
  <svg {...stroke(size, 2.6)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const LocationIcon = ({ size = 14 }: P) => (
  <svg {...stroke(size, 2)}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
export const ExternalIcon = ({ size = 12 }: P) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M3.5 8.5l5-5M4.5 3.5h4v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const HelpfulIcon = ({ size = 15 }: P) => (
  <svg {...stroke(size, 2.2)}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
export const PlayIcon = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 4.5v15l13-7.5z" />
  </svg>
);
export const BackIcon = ({ size = 16 }: P) => (
  <svg width={size} height={Math.round((size * 11) / 15)} viewBox="0 0 15 11" fill="none" aria-hidden="true">
    <path d="M14 5.5H2M6 1.5l-4 4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const ChevronIcon = ({ size = 12 }: P) => (
  <svg {...stroke(size, 2.5)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
export const AnswersIcon = ({ size = 15 }: P) => (
  <svg {...stroke(size, 2)}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
  </svg>
);
export const BellIcon = ({ size = 16 }: P) => (
  <svg {...stroke(size, 2)}>
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21h4" />
  </svg>
);
export const PinIcon = ({ size = 14 }: P) => (
  <svg {...stroke(size, 2)}>
    <path d="M12 17v5M8 3h8l-1 6 3 4H6l3-4z" />
  </svg>
);
export const SearchIcon = ({ size = 18 }: P) => (
  <svg {...stroke(size, 2)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);
export const CalendarIcon = ({ size = 16 }: P) => (
  <svg {...stroke(size, 2)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
