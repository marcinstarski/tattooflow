import Link from "next/link";
import Image from "next/image";
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

const mobileNav = [
  { href: "/app", label: "Start" },
  { href: "/app/calendar", label: "Kalendarz" },
  { href: "/app/leads", label: "Leady" },
  { href: "/app/messages", label: "Wiadomości" },
  { href: "/app/clients", label: "Klienci" }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-900">
      <div className="flex">
        <aside className="hidden w-64 border-r border-ink-800 bg-ink-900/80 p-6 lg:block">
          <div className="flex items-center gap-3">
            <Image src="/taflologo.png" alt="TaFlo" width={120} height={40} className="h-8 w-auto" />
            <span className="sr-only">TaFlo</span>
          </div>
          <div className="mt-8 flex flex-col gap-3 text-sm text-ink-300">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 hover:bg-ink-800">
                {item.label}
              </Link>
            ))}
          </div>
        </aside>
        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-28 lg:p-10 lg:pb-10">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="hidden text-sm text-ink-300 lg:block">Strefa: Europe/Warsaw · Waluta: PLN</div>
            <div className="hidden text-xs text-ink-400 lg:block">Plan: Trial</div>
            <div className="flex flex-col gap-3 lg:hidden">
              <div className="flex items-center justify-between">
                <Image src="/taflologo.png" alt="TaFlo" width={120} height={40} className="h-8 w-auto" />
                <span className="text-xs text-ink-400">Plan: Trial</span>
              </div>
              <div className="text-xs text-ink-500">Strefa: Europe/Warsaw · Waluta: PLN</div>
            </div>
          </div>
          {children}
        </main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-ink-800 bg-ink-900/95 px-3 py-2 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          {mobileNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] text-ink-300"
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
