import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-ink-700 py-10 text-sm text-ink-300">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="TaFlo" width={140} height={46} className="h-8 w-auto" />
            <span className="sr-only">TaFlo</span>
          </div>
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
      <div className="mt-6 text-xs text-ink-500">© 2026 TaFlo. Wszystkie prawa zastrzeżone.</div>
    </footer>
  );
}
