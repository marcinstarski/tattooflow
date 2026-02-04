"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type DemoLead = {
  id: string;
  name: string;
  source: string;
  note: string;
  budget: string;
  depositAmount: string;
  depositStatus: "Wpłacony" | "Nieopłacony";
};

type DemoMessage = {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  time: string;
};

const tabs = ["Leady", "Kalendarz", "Wiadomości", "Zadatki"] as const;
type Tab = (typeof tabs)[number];

const demoLeads: Record<"new" | "contacted" | "booked" | "lost", DemoLead[]> = {
  new: [
    { id: "l1", name: "Maja K.", source: "Instagram", note: "Kwiaty na ramię, delikatne cienie.", budget: "1200 zł", depositAmount: "200 zł", depositStatus: "Wpłacony" },
    { id: "l2", name: "Ola P.", source: "Strona", note: "Mały napis na żebrach.", budget: "400 zł", depositAmount: "150 zł", depositStatus: "Nieopłacony" },
  ],
  contacted: [
    { id: "l3", name: "Kacper M.", source: "Facebook", note: "Blackwork na łydce.", budget: "1600 zł", depositAmount: "300 zł", depositStatus: "Nieopłacony" }
  ],
  booked: [
    { id: "l4", name: "Ania R.", source: "Instagram", note: "Motyl na obojczyku.", budget: "900 zł", depositAmount: "200 zł", depositStatus: "Wpłacony" }
  ],
  lost: [
    { id: "l5", name: "Bartek S.", source: "Polecenie", note: "Zrezygnował z terminu.", budget: "—", depositAmount: "—", depositStatus: "Nieopłacony" }
  ]
};

const demoAppointments = [
  { day: "Pon", date: "10.02", items: [{ time: "10:00", name: "Maja K." }, { time: "14:00", name: "Ania R." }] },
  { day: "Wt", date: "11.02", items: [{ time: "12:00", name: "Kacper M." }] },
  { day: "Śr", date: "12.02", items: [] },
  { day: "Cz", date: "13.02", items: [{ time: "11:00", name: "Ola P." }] },
  { day: "Pt", date: "14.02", items: [{ time: "16:00", name: "Marta W." }] },
  { day: "Sb", date: "15.02", items: [] },
  { day: "Nd", date: "16.02", items: [] }
];

const demoThreads = [
  {
    id: "t1",
    name: "Maja K.",
    channel: "Instagram",
    depositAmount: "200 zł",
    depositStatus: "Wpłacony",
    messages: [
      { id: "m1", direction: "inbound", body: "Hej! Czy masz wolny termin w lutym?", time: "10:12" },
      { id: "m2", direction: "outbound", body: "Tak, mam kilka okienek. Jaki motyw i miejsce?", time: "10:14" },
    ]
  },
  {
    id: "t2",
    name: "Ola P.",
    channel: "Facebook",
    depositAmount: "150 zł",
    depositStatus: "Nieopłacony",
    messages: [
      { id: "m3", direction: "inbound", body: "Cześć, ile kosztuje mały napis?", time: "12:40" }
    ]
  }
];

const demoDeposits = [
  { id: "d1", name: "Ania R.", date: "12.02 · 14:00", amount: "200 zł", status: "Wpłacony" },
  { id: "d2", name: "Kacper M.", date: "11.02 · 12:00", amount: "300 zł", status: "Nieopłacony" },
  { id: "d3", name: "Maja K.", date: "10.02 · 10:00", amount: "200 zł", status: "Wpłacony" }
];

export default function DemoPage() {
  const [active, setActive] = useState<Tab>("Leady");
  const [selectedLead, setSelectedLead] = useState<DemoLead>(demoLeads.new[0]);
  const [selectedThread, setSelectedThread] = useState(demoThreads[0]);

  const leadColumns = useMemo(() => ([
    { key: "new", label: "Nowe", items: demoLeads.new },
    { key: "contacted", label: "Skontaktowane", items: demoLeads.contacted },
    { key: "booked", label: "Zarezerwowane", items: demoLeads.booked },
    { key: "lost", label: "Utracone", items: demoLeads.lost }
  ]), []);

  return (
    <main className="pb-24">
      <section className="py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-display">Demo produktu</h1>
            <p className="mt-4 text-ink-200">
              Klikalny podgląd kluczowych ekranów. Dane są przykładowe i tylko do prezentacji.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[220px_1fr]">
          <Card className="space-y-3">
            <div className="text-xs text-ink-400">Nawigacja demo</div>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  active === tab ? "border-accent-500 bg-ink-900" : "border-ink-700 bg-ink-900/40"
                }`}
              >
                {tab}
              </button>
            ))}
          </Card>

          <Card className="min-h-[540px]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-ink-400">Podgląd: {active}</div>
              <div className="text-xs text-ink-500">Tryb demo · brak zapisu zmian</div>
            </div>

            {active === "Leady" && (
              <div className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr]">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {leadColumns.map((col) => (
                    <div key={col.key} className="rounded-xl border border-ink-700 bg-ink-900/50 p-3 text-sm">
                      <div className="text-xs text-ink-400">{col.label}</div>
                      <div className="mt-3 space-y-2">
                        {col.items.map((lead) => (
                          <button
                            key={lead.id}
                            onClick={() => setSelectedLead(lead)}
                            className={`w-full rounded-lg border p-2 text-left text-xs transition ${
                              selectedLead.id === lead.id ? "border-accent-500/70 bg-ink-900" : "border-ink-700"
                            }`}
                          >
                            <div className="font-semibold">{lead.name}</div>
                            <div className="text-[11px] text-ink-400">{lead.source}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4 text-sm">
                  <div className="text-xs text-ink-400">Szczegóły leada</div>
                  <div className="mt-3 text-lg font-semibold">{selectedLead.name}</div>
                  <div className="mt-2 text-xs text-ink-400">Źródło: {selectedLead.source}</div>
                  <div className="mt-3 text-sm text-ink-200">{selectedLead.note}</div>
                  <div className="mt-3 text-xs text-ink-400">Budżet: {selectedLead.budget}</div>
                  <div className="mt-2 text-xs text-ink-400">
                    Zadatek: {selectedLead.depositAmount} ·{" "}
                    <span className={selectedLead.depositStatus === "Wpłacony" ? "text-emerald-300" : "text-amber-300"}>
                      {selectedLead.depositStatus}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary">Zadzwoń</Button>
                    <Button variant="secondary">Wyślij wiadomość</Button>
                  </div>
                </div>
              </div>
            )}

            {active === "Kalendarz" && (
              <div className="mt-6 grid gap-3 md:grid-cols-7">
                {demoAppointments.map((day) => (
                  <div key={day.day} className="rounded-xl border border-ink-700 bg-ink-900/50 p-3 text-xs">
                    <div className="text-ink-400">{day.day}</div>
                    <div className="font-semibold text-ink-100">{day.date}</div>
                    <div className="mt-2 space-y-2">
                      {day.items.length === 0 && <div className="text-ink-500">Brak wizyt</div>}
                      {day.items.map((item, idx) => (
                        <div key={`${day.day}-${idx}`} className="rounded-lg border border-ink-700 px-2 py-1">
                          <div className="font-semibold">{item.time}</div>
                          <div className="text-ink-400">{item.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {active === "Wiadomości" && (
              <div className="mt-6 grid gap-4 md:grid-cols-[1fr_2fr]">
                <div className="space-y-3">
                  {demoThreads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={`w-full rounded-xl border p-3 text-left text-sm transition ${
                        selectedThread.id === thread.id ? "border-accent-500/70 bg-ink-900" : "border-ink-700"
                      }`}
                    >
                      <div className="font-semibold">{thread.name}</div>
                      <div className="text-xs text-ink-400">{thread.channel}</div>
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border border-ink-700 bg-ink-900/50 p-4 text-sm">
                  <div className="text-xs text-ink-400">Wątek: {selectedThread.name}</div>
                  <div className="mt-3 space-y-3">
                    {selectedThread.messages.map((msg: DemoMessage) => (
                      <div
                        key={msg.id}
                        className={`max-w-[80%] rounded-2xl border p-3 text-xs ${
                          msg.direction === "outbound"
                            ? "ml-auto border-accent-500/60 bg-accent-500/20"
                            : "border-ink-700 bg-ink-900/80"
                        }`}
                      >
                        <div className="text-[10px] text-ink-400">{msg.time}</div>
                        <div className="mt-1 text-ink-100">{msg.body}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-ink-400">
                    Zadatek: {selectedThread.depositAmount} ·{" "}
                    <span className={selectedThread.depositStatus === "Wpłacony" ? "text-emerald-300" : "text-amber-300"}>
                      {selectedThread.depositStatus}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary">Odpowiedz</Button>
                    <Button variant="secondary">Wyślij link do zadatku</Button>
                  </div>
                </div>
              </div>
            )}

            {active === "Zadatki" && (
              <div className="mt-6 space-y-3">
                {demoDeposits.map((row) => (
                  <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-700 bg-ink-900/50 p-4 text-sm">
                    <div>
                      <div className="font-semibold">{row.name}</div>
                      <div className="text-xs text-ink-400">{row.date}</div>
                    </div>
                    <div className="text-sm">{row.amount}</div>
                    <div className={`text-xs ${row.status === "Wpłacony" ? "text-emerald-300" : "text-amber-300"}`}>
                      {row.status}
                    </div>
                    <Button variant="secondary">Wyślij link</Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}
