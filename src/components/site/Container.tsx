import type { ComponentPropsWithoutRef } from "react";

export function Container({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={`mx-auto w-full max-w-[1200px] px-6 ${className}`} {...props} />;
}
