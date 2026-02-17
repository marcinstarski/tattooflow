"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    if (!email) {
      setStatus("error");
      setMessage("Wpisz email.");
      return;
    }
    setStatus("sending");
    setMessage(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus("error");
      setMessage(data?.error || "Nie udało się wysłać linku.");
      return;
    }
    setStatus("ok");
    setMessage("Jeśli konto istnieje, wysłaliśmy link do resetu hasła.");
  };

  return (
    <main className="min-h-screen bg-ink-900 px-6">
      <div className="mx-auto flex max-w-md flex-col gap-6 py-24">
        <div className="flex items-center justify-between">
          <Image src="/taflologo.png" alt="TaFlo" width={140} height={46} className="h-9 w-auto" />
          <Link
            href="/"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-700 text-sm text-ink-300 transition hover:bg-ink-800 hover:text-ink-100"
            aria-label="Powrót na stronę główną"
          >
            ×
          </Link>
        </div>
        <h1 className="text-3xl font-display">Nie pamiętasz hasła?</h1>
        <p className="text-sm text-ink-300">Podaj email, a wyślemy link do resetu hasła.</p>
        <div className="space-y-3">
          <Input
            placeholder="Email"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button className="w-full" onClick={submit} disabled={status === "sending"}>
            {status === "sending" ? "Wysyłanie..." : "Wyślij link"}
          </Button>
          {message && (
            <div className={status === "ok" ? "text-sm text-emerald-300" : "text-sm text-red-400"}>
              {message}
            </div>
          )}
        </div>
        <Link href="/auth/login" className="text-sm text-accent-400">
          Wróć do logowania
        </Link>
      </div>
    </main>
  );
}
