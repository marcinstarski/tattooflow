"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackFromQuery = searchParams.get("callbackUrl");
  const callbackUrl = callbackFromQuery && callbackFromQuery.startsWith("/")
    ? callbackFromQuery
    : "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Wpisz email i hasło.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", { email, password, callbackUrl, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Nieprawidłowy email lub hasło.");
    }
    if (result?.url) {
      try {
        localStorage.setItem("taflo_remember", remember ? "1" : "0");
        localStorage.setItem("taflo_login_at", String(Date.now()));
      } catch {
        // ignore
      }
      let nextUrl = result.url;
      try {
        if (callbackUrl.includes("/onboarding")) {
          nextUrl = callbackUrl;
        } else {
          const profileRes = await fetch("/api/profile");
          if (!profileRes.ok) {
            nextUrl = "/onboarding";
          }
        }
      } catch {
        // ignore
      }
      window.location.href = nextUrl;
    }
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
        <h1 className="text-3xl font-display">Zaloguj się</h1>
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
          <div className="relative">
            <Input
              placeholder="Hasło"
              type={showPassword ? "text" : "password"}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="current-password"
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
          {error && <div className="text-xs text-red-300">{error}</div>}
          <label className="flex items-center gap-2 text-xs text-ink-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-ink-600 bg-ink-900"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Zapamiętaj mnie na tym urządzeniu
          </label>
          <Link href="/auth/forgot-password" className="text-xs text-accent-400">
            Nie pamiętasz hasła?
          </Link>
          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logowanie..." : "Zaloguj"}
          </Button>
        </div>
        <p className="text-sm text-ink-300">
          Nie masz konta? <Link href="/auth/register" className="text-accent-400">Zarejestruj się</Link>
        </p>
      </div>
    </main>
  );
}
