"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    if (!token) {
      setStatus("error");
      setMessage("Brak tokenu resetu.");
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setMessage("Hasło musi mieć minimum 8 znaków.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setMessage("Hasła nie są takie same.");
      return;
    }
    setStatus("saving");
    setMessage(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus("error");
      setMessage(data?.error || "Nie udało się ustawić hasła.");
      return;
    }
    setStatus("ok");
    setMessage("Hasło ustawione. Możesz się zalogować.");
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
        <h1 className="text-3xl font-display">Ustaw nowe hasło</h1>
        <div className="space-y-3">
          <div className="relative">
            <Input
              placeholder="Hasło"
              type={showPassword ? "text" : "password"}
              autoCapitalize="none"
              autoCorrect="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-300 hover:text-ink-100"
            >
              {showPassword ? "Ukryj" : "Pokaż"}
            </button>
          </div>
          <Input
            placeholder="Powtórz hasło"
            type={showPassword ? "text" : "password"}
            autoCapitalize="none"
            autoCorrect="off"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button className="w-full" onClick={submit} disabled={status === "saving"}>
            {status === "saving" ? "Zapisywanie..." : "Ustaw hasło"}
          </Button>
          {message && (
            <div className={status === "ok" ? "text-sm text-emerald-300" : "text-sm text-red-400"}>
              {message}
            </div>
          )}
          {status === "ok" && (
            <Link href="/auth/login" className="text-sm text-accent-400">
              Przejdź do logowania
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-900 px-6 py-24 text-sm text-ink-300">Ładowanie...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
