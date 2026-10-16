import Image from "next/image";
import Link from "next/link";

// public/brand/wordmark*.png are 3580x676 and include the tagline.
const RATIO = 3580 / 676;

export function Wordmark({
  tone = "dark",
  height = 36,
  className = "",
}: {
  /** "light" for use on navy backgrounds. */
  tone?: "dark" | "light";
  height?: number;
  className?: string;
}) {
  return (
    <Link href="/" aria-label="MISSIONQUAL home" className={`inline-block shrink-0 ${className}`}>
      <Image
        src={tone === "light" ? "/brand/wordmark-white.png" : "/brand/wordmark.png"}
        alt="MISSIONQUAL"
        width={Math.round(height * RATIO)}
        height={height}
        priority
      />
    </Link>
  );
}
