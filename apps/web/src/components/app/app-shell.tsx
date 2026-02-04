import Link from "next/link";
import { ReactNode } from "react";

const nav = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/leads", label: "Leady" },
  { href: "/app/clients", label: "Klienci" },
  { href: "/app/calendar", label: "Kalendarz" },
  { href: "/app/deposits", label: "Zadatki" },
  { href: "/app/messages", label: "Wiadomości" },
  { href: "/app/campaigns", label: "Kampanie" },
  { href: "/app/profile", label: "Mój profil" },
  { href: "/app/billing", label: "Rozliczenia" },
  { href: "/app/settings", label: "Ustawienia" }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-900">
      <div className="flex">
        <aside className="hidden w-64 border-r border-ink-800 bg-ink-900/80 p-6 lg:block">
          <div className="text-lg font-display">InkFlow</div>
          <div className="mt-8 flex flex-col gap-3 text-sm text-ink-300">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 hover:bg-ink-800">
                {item.label}
              </Link>
            ))}
          </div>
        </aside>
        <main className="flex-1 p-6 lg:p-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-ink-300">Strefa: Europe/Warsaw · Waluta: PLN</div>
            <div className="text-xs text-ink-400">Plan: Trial</div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
