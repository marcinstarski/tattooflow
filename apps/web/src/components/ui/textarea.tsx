import { clsx } from "clsx";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-2 text-base text-ink-100 placeholder:text-ink-400 focus:border-accent-500 focus:outline-none sm:text-sm",
        className
      )}
      {...props}
    />
  );
}
