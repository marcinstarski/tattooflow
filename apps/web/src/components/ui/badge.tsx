import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-ink-600 px-3 py-1 text-xs font-semibold text-ink-100",
        className
      )}
      {...props}
    />
  );
}
