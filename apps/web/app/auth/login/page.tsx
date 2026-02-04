"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="min-h-screen bg-ink-900 px-6">
      <div className="mx-auto flex max-w-md flex-col gap-6 py-24">
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
