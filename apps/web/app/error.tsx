"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pl">
      <body className="bg-ink-900 text-ink-100">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-3xl font-display">Ups, coś poszło nie tak</h1>
          <p className="text-sm text-ink-300">
            Spróbuj odświeżyć lub wróć do panelu. Jeśli problem wraca, daj znać.
          </p>
          <div className="flex gap-3">
            <button
              className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-ink-900"
              onClick={() => reset()}
            >
              Spróbuj ponownie
            </button>
            <Link className="rounded-xl border border-ink-700 px-4 py-2 text-sm" href="/app">
              Wróć do aplikacji
            </Link>
          </div>
          {process.env.NODE_ENV !== "production" && (
            <pre className="mt-4 w-full overflow-auto rounded-xl bg-ink-800 p-4 text-left text-xs text-ink-200">
              {error.message}
            </pre>
          )}
        </div>
      </body>
    </html>
  );
}
