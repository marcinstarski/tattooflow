import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink-700 py-10 text-sm text-ink-300">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-display text-ink-100">Taflo CRM</div>
          <p className="mt-2 max-w-md text-xs text-ink-300">
            CRM i automatyzacje dla tatuatorów. Leady, kalendarz, zadatki i marketing w jednym miejscu.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/legal/terms">Regulamin</Link>
          <Link href="/legal/privacy">Polityka prywatności</Link>
          <Link href="/legal/cookies">Cookies</Link>
          <Link href="/support">Pomoc</Link>
        </div>
      </div>
      <div className="mt-6 text-xs text-ink-500">© 2026 Taflo. Wszystkie prawa zastrzeżone.</div>
    </footer>
  );
}
