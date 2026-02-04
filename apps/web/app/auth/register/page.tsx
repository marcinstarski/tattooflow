"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studioName, setStudioName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  const submit = async () => {
    setStatus("loading");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, studioName })
    });
    setStatus(res.ok ? "ok" : "error");
    if (res.ok) {
      await signIn("credentials", { email, password, callbackUrl: "/onboarding" });
    }
  };

  return (
    <main className="min-h-screen bg-ink-900 px-6">
      <div className="mx-auto flex max-w-md flex-col gap-6 py-24">
        <h1 className="text-3xl font-display">Załóż konto</h1>
        <div className="space-y-3">
          <Input placeholder="Nazwa studia" value={studioName} onChange={(e) => setStudioName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            placeholder="Hasło"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full" onClick={submit}>
            Załóż konto + trial
          </Button>
          {status === "error" && <div className="text-sm text-red-400">Nie udało się utworzyć konta.</div>}
        </div>
        <p className="text-sm text-ink-300">
          Masz już konto? <Link href="/auth/login" className="text-accent-400">Zaloguj się</Link>
        </p>
      </div>
    </main>
  );
}
