"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const steps = ["Studio", "Manager"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    studioName: "",
    timezone: "Europe/Warsaw",
    artistName: "",
    artistEmail: "",
    artistPhone: "",
  });

  useEffect(() => {
    fetch("/api/org")
      .then((res) => res.json())
      .then((data) => {
        if (data?.name) {
          setForm((prev) => ({ ...prev, studioName: data.name }));
        }
        if (data?.timezone) {
          setForm((prev) => ({ ...prev, timezone: data.timezone }));
        }
      })
      .catch(() => undefined);
  }, []);

  const next = async () => {
    if (step === steps.length - 1) {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      window.location.href = "/app";
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <main className="min-h-screen bg-ink-900 px-6">
      <div className="mx-auto max-w-2xl py-16">
        <div className="text-xs text-ink-400">Krok {step + 1} / {steps.length} · {steps[step]}</div>
        <h1 className="mt-2 text-3xl font-display">Onboarding</h1>

        <div className="mt-8 space-y-4">
          {step === 0 && (
            <>
              <label className="text-xs text-ink-400">Strefa czasu</label>
              <select
                className="w-full rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-2 text-sm"
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              >
                <option value="Europe/Warsaw">Europe/Warsaw (Polska)</option>
                <option value="Europe/Berlin">Europe/Berlin</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Chicago">America/Chicago</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
              </select>
            </>
          )}
          {step === 1 && (
            <>
              <Input placeholder="Imię i nazwisko" value={form.artistName} onChange={(e) => setForm({ ...form, artistName: e.target.value })} />
              <Input placeholder="Email" value={form.artistEmail} onChange={(e) => setForm({ ...form, artistEmail: e.target.value })} />
              <Input placeholder="Telefon" value={form.artistPhone} onChange={(e) => setForm({ ...form, artistPhone: e.target.value })} />
            </>
          )}
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))}>
            Wstecz
          </Button>
          <Button onClick={next}>{step === steps.length - 1 ? "Zakończ" : "Dalej"}</Button>
        </div>
      </div>
    </main>
  );
}
