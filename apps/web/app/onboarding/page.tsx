"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const steps = [
  "Studio",
  "Artysta",
  "Zadatek",
  "Szablony",
  "Pierwszy termin",
  "Widget"
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [form, setForm] = useState({
    studioName: "",
    address: "",
    timezone: "Europe/Warsaw",
    artistName: "",
    artistEmail: "",
    artistPhone: "",
    depositType: "fixed",
    depositValue: "200",
    depositDueDays: "7",
    templateReminder: "Hej {{clientName}}, przypomnienie o wizycie {{appointmentDate}}.",
    templateDeposit: "Cześć:) Podsyłam tutaj link do zadatku na naszą sesję: {{depositLink}}",
    templateFollowUp: "Czy mamy wrócić do tematu tatuażu?",
    appointmentDate: "",
    appointmentTime: "",
    appointmentDuration: "2"
  });

  useEffect(() => {
    fetch("/api/org")
      .then((res) => res.json())
      .then((data) => setOrgId(data?.id || null))
      .catch(() => setOrgId(null));
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
              <Input placeholder="Nazwa studia" value={form.studioName} onChange={(e) => setForm({ ...form, studioName: e.target.value })} />
              <Input placeholder="Adres" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <Input placeholder="Strefa czasu" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
            </>
          )}
          {step === 1 && (
            <>
              <Input placeholder="Imię i nazwisko" value={form.artistName} onChange={(e) => setForm({ ...form, artistName: e.target.value })} />
              <Input placeholder="Email" value={form.artistEmail} onChange={(e) => setForm({ ...form, artistEmail: e.target.value })} />
              <Input placeholder="Telefon do SMS" value={form.artistPhone} onChange={(e) => setForm({ ...form, artistPhone: e.target.value })} />
            </>
          )}
          {step === 2 && (
            <>
              <Input placeholder="Typ zadatku (fixed/percent)" value={form.depositType} onChange={(e) => setForm({ ...form, depositType: e.target.value })} />
              <Input placeholder="Wartość" value={form.depositValue} onChange={(e) => setForm({ ...form, depositValue: e.target.value })} />
              <Input placeholder="Termin w dniach" value={form.depositDueDays} onChange={(e) => setForm({ ...form, depositDueDays: e.target.value })} />
            </>
          )}
          {step === 3 && (
            <>
              <Textarea rows={3} placeholder="Szablon przypomnienia" value={form.templateReminder} onChange={(e) => setForm({ ...form, templateReminder: e.target.value })} />
              <Textarea rows={3} placeholder="Szablon zadatku" value={form.templateDeposit} onChange={(e) => setForm({ ...form, templateDeposit: e.target.value })} />
              <Textarea rows={3} placeholder="Follow-up" value={form.templateFollowUp} onChange={(e) => setForm({ ...form, templateFollowUp: e.target.value })} />
            </>
          )}
          {step === 4 && (
            <>
              <Input type="date" value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} />
              <Input type="time" value={form.appointmentTime} onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })} />
              <Input placeholder="Czas (h)" value={form.appointmentDuration} onChange={(e) => setForm({ ...form, appointmentDuration: e.target.value })} />
            </>
          )}
          {step === 5 && (
            <div className="rounded-xl border border-ink-700 bg-ink-900/70 p-4 text-sm text-ink-200">
              <p>Wklej na swoją stronę:</p>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-ink-800 p-3 text-xs">
{`<script src="https://twoj-domenowy-url/widget.js" data-org="${orgId || "ORG_ID"}"></script>`}
              </pre>
              <p className="mt-4 text-xs text-ink-400">Lub użyj bezpośredniego linku do formularza:</p>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-ink-800 p-3 text-xs">
{`https://twoj-domenowy-url/lead/${orgId || "ORG_ID"}`}
              </pre>
            </div>
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
