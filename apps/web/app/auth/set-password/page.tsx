"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

type InviteInfo = {
  email: string;
  name?: string | null;
  orgName: string;
};

export default function SetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false);
        setMessage("Brak tokenu zaproszenia.");
        return;
      }
      const res = await fetch(`/api/invites/validate?token=${encodeURIComponent(token)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data?.error || "Zaproszenie jest nieprawidłowe.");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as InviteInfo;
      setInvite(data);
      setLoading(false);
    };
    load().catch(() => {
      setMessage("Nie udało się zweryfikować zaproszenia.");
      setLoading(false);
    });
  }, [token]);

  const submit = async () => {
    setStatus("saving");
    setMessage(null);
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
    const res = await fetch("/api/invites/complete", {
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
        <h1 className="text-3xl font-display">Ustaw hasło</h1>
        {loading ? (
          <div className="text-sm text-ink-300">Sprawdzamy zaproszenie...</div>
        ) : invite ? (
          <>
            <div className="text-sm text-ink-300">
              Studio: <span className="text-ink-100">{invite.orgName}</span>
            </div>
            <div className="space-y-3">
              <div className="text-xs text-ink-500">{invite.email}</div>
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
          </>
        ) : (
          <div className="text-sm text-red-400">{message || "Zaproszenie jest nieprawidłowe."}</div>
        )}
      </div>
    </main>
  );
}
