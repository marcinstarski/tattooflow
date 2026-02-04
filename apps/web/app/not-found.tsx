import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-display">Nie znaleziono strony</h1>
      <p className="text-sm text-ink-300">Sprawdź adres lub wróć do panelu.</p>
      <Link className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-ink-900" href="/app">
        Wróć do aplikacji
      </Link>
    </div>
  );
}
