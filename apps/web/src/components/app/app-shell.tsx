"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { signOut } from "next-auth/react";
import { SessionGuard } from "@/components/common/session-guard";

const nav = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/calendar", label: "Kalendarz" },
  { href: "/app/messages", label: "Wiadomości" },
  { href: "/app/leads", label: "Leady" },
  { href: "/app/clients", label: "Klienci" },
  { href: "/app/deposits", label: "Zadatki" },
  { href: "/app/campaigns", label: "Kampanie" },
  { href: "/app/profile", label: "Mój profil" },
  { href: "/app/billing", label: "Rozliczenia" },
  { href: "/app/settings", label: "Ustawienia" }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-900">
      <SessionGuard />
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
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-10">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="hidden text-sm text-ink-300 lg:block">Strefa: Europe/Warsaw · Waluta: PLN</div>
            <div className="hidden items-center gap-4 lg:flex">
              <div className="text-xs text-ink-400">Plan: Trial</div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="text-xs text-ink-300 hover:text-ink-100"
              >
                Wyloguj
              </button>
            </div>
            <div className="flex flex-col gap-3 lg:hidden">
              <div className="flex items-center justify-between">
                <Image src="/taflologo.png" alt="TaFlo" width={120} height={40} className="h-8 w-auto" />
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="text-xs text-ink-300 hover:text-ink-100"
                >
                  Wyloguj
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-ink-500">
                <span>Strefa: Europe/Warsaw · Waluta: PLN</span>
                <span>Plan: Trial</span>
              </div>
            </div>
          </div>
          <div className="mb-6 lg:hidden">
            <div className="flex max-w-full gap-2 overflow-x-auto pb-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full border border-ink-700 px-4 py-1.5 text-xs text-ink-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
