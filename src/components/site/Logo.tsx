import Image from "next/image";
import Link from "next/link";

// public/logo-light.png is 1200x122: light letters on transparent, for navy.
const RATIO = 1200 / 122;

export function Logo({ height, className = "" }: { height: number; className?: string }) {
  return (
    <Link href="/" aria-label="MISSIONQUAL home" className={`block shrink-0 leading-none ${className}`}>
      <Image
        src="/logo-light.png"
        alt="MISSIONQUAL"
        width={Math.round(height * RATIO)}
        height={height}
        priority
      />
    </Link>
  );
}
