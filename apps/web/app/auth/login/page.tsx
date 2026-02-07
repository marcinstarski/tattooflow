"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="min-h-screen bg-ink-900 px-6">
      <div className="mx-auto flex max-w-md flex-col gap-6 py-24">
        <div className="flex items-center justify-between">
          <Image src="/logo.png" alt="TaFlo" width={140} height={46} className="h-9 w-auto" />
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
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            placeholder="Hasło"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={() => signIn("credentials", { email, password, callbackUrl: "/app" })}
          >
            Zaloguj
          </Button>
        </div>
        <p className="text-sm text-ink-300">
          Nie masz konta? <Link href="/auth/register" className="text-accent-400">Zarejestruj się</Link>
        </p>
      </div>
    </main>
  );
}
