import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-2 text-sm text-ink-100 placeholder:text-ink-400 focus:border-accent-500 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}
