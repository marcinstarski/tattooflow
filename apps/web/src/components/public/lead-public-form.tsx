"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function LeadPublicForm({ orgId }: { orgId: string }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    marketingOptIn: false,
    honeypot: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/public/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId,
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        message: form.message || undefined,
        marketingOptIn: form.marketingOptIn,
        honeypot: form.honeypot,
        source: "website"
      })
    });

    if (res.ok) {
      setStatus("success");
      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
        marketingOptIn: false,
        honeypot: "",
      });
      return;
    }

    setStatus("error");
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        placeholder="Imię i nazwisko"
        value={form.name}
        required
        onChange={(event) => setForm({ ...form, name: event.target.value })}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <Input
          placeholder="Telefon"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
        />
      </div>
      <Textarea
        rows={4}
        placeholder="Opisz krótko pomysł / miejsce / termin"
        value={form.message}
        onChange={(event) => setForm({ ...form, message: event.target.value })}
      />
      <input
        value={form.honeypot}
        onChange={(event) => setForm({ ...form, honeypot: event.target.value })}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />
      <label className="flex items-center gap-2 text-xs text-ink-300">
        <input
          type="checkbox"
          checked={form.marketingOptIn}
          onChange={(event) => setForm({ ...form, marketingOptIn: event.target.checked })}
        />
        Wyrażam zgodę na kontakt marketingowy.
      </label>
      <div className="text-[11px] text-ink-500">
        Wysyłając formularz akceptujesz{" "}
        <a className="text-accent-400" href="/legal/privacy">politykę prywatności</a>.
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!form.name || status === "sending"}>
          {status === "sending" ? "Wysyłanie..." : "Wyślij zgłoszenie"}
        </Button>
        {status === "success" && <span className="text-xs text-emerald-300">Dziękujemy! Odezwemy się wkrótce.</span>}
        {status === "error" && <span className="text-xs text-red-300">Ups, coś poszło nie tak.</span>}
      </div>
    </form>
  );
}
