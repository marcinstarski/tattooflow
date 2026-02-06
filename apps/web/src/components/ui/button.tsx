import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-ink-900";
  const styles = {
    primary: "bg-gradient-to-r from-[#28c7ff] via-[#5a7dff] to-[#b24bff] text-white hover:from-[#46d5ff] hover:via-[#6f8bff] hover:to-[#c05cff] shadow-glow",
    secondary: "bg-ink-700 text-ink-100 hover:bg-ink-600",
    ghost: "bg-transparent text-ink-100 hover:bg-ink-700"
  };
  return <button className={clsx(base, styles[variant], className)} {...props} />;
}
