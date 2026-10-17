import Link from "next/link";
import s from "./shared.module.css";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`${s.logo} ${className}`} aria-label="MISSIONQUAL home">
      MISSION<span>QUAL</span>
    </Link>
  );
}
