"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const statuses = ["new", "contacted", "booked", "lost"] as const;

type LeadStatus = (typeof statuses)[number];

const statusLabels: Record<LeadStatus, string> = {
  new: "Nowy",
  contacted: "Skontaktowany",
  booked: "Zarezerwowany",
  lost: "Utracony"
};

type Lead = {
  id: string;
  name: string;
  status: LeadStatus;
  source: string;
  clientId?: string | null;
  email?: string | null;
  phone?: string | null;
  igHandle?: string | null;
  message?: string | null;
  createdAt: string;
};

type DepositSummary = {
  hasDeposit: boolean;
  amount?: number;
  status?: "none" | "pending" | "paid" | "expired";
  startsAt?: string;
};

const emptyForm = { name: "", email: "", phone: "", igHandle: "", source: "website", message: "" };

type LeadForm = typeof emptyForm;

export function LeadsBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [mobileStatus, setMobileStatus] = useState<LeadStatus>("new");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [smsBody, setSmsBody] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [contactError, setContactError] = useState<string | null>(null);
  const [depositStatus, setDepositStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [depositError, setDepositError] = useState<string | null>(null);
  const [depositSummary, setDepositSummary] = useState<DepositSummary | null>(null);
  const [depositLoading, setDepositLoading] = useState(false);

  const formatPLN = (value: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);

  const depositStatusLabel = (status?: DepositSummary["status"]) => {
    if (status === "paid") return "Wpłacony";
    return "Nieopłacony";
  };

  const grouped = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {
      new: [],
      contacted: [],
      booked: [],
      lost: []
    };
    leads.forEach((lead) => map[lead.status].push(lead));
    return map;
  }, [leads]);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/leads");
    if (res.ok) {
      const data = (await res.json()) as Lead[];
      setLeads(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const clientId = selectedLead?.clientId;
    if (!clientId) {
      setDepositSummary(null);
      return;
    }
    const fetchSummary = async () => {
      setDepositLoading(true);
      const res = await fetch(`/api/deposits/summary?clientId=${clientId}`);
      if (res.ok) {
        const data = (await res.json()) as DepositSummary;
        setDepositSummary(data);
      } else {
        setDepositSummary(null);
      }
      setDepositLoading(false);
    };
    fetchSummary().catch(() => setDepositLoading(false));
  }, [selectedLead?.clientId]);

  const createLead = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email || undefined,
        phone: form.phone || undefined,
        igHandle: form.igHandle || undefined,
        source: form.source,
        message: form.message || undefined
      })
    });
    if (res.ok) {
      setForm(emptyForm);
      await load();
      setSaving(false);
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data?.error || "Nie udało się dodać leada.");
    setSaving(false);
  };

  const updateStatus = async (id: string, status: LeadStatus) => {
    setError(null);
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    await load();
  };

  const openLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEmailSubject("");
    setEmailBody("");
    setSmsBody("");
    setMessageBody("");
    setContactStatus("idle");
    setContactError(null);
    setDepositStatus("idle");
    setDepositError(null);
  };

  const closeLead = () => setSelectedLead(null);

  const sendLeadContact = async (channel: "email" | "sms") => {
    if (!selectedLead) return;
    const body = channel === "email" ? emailBody : smsBody;
    if (!body.trim()) return;
    setContactStatus("sending");
    setContactError(null);
    const res = await fetch(`/api/leads/${selectedLead.id}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel,
        subject: channel === "email" ? emailSubject : undefined,
        body: body.trim()
      })
    });
    if (res.ok) {
      setContactStatus("success");
      if (channel === "email") setEmailBody("");
      if (channel === "sms") setSmsBody("");
      return;
    }
    const data = await res.json().catch(() => ({}));
    setContactStatus("error");
    setContactError(data?.error || "Nie udało się wysłać.");
  };

  const sendLeadMessage = async () => {
    if (!selectedLead) return;
    if (!messageBody.trim()) return;
    const channel = selectedLead.source === "facebook" ? "facebook" : "instagram";
    setContactStatus("sending");
    setContactError(null);
    const res = await fetch(`/api/leads/${selectedLead.id}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, body: messageBody.trim() })
    });
    if (res.ok) {
      setContactStatus("success");
      setMessageBody("");
      return;
    }
    const data = await res.json().catch(() => ({}));
    setContactStatus("error");
    setContactError(data?.error || "Nie udało się wysłać.");
  };

  const sendDepositLink = async () => {
    if (!selectedLead?.clientId) return;
    setDepositStatus("sending");
    setDepositError(null);
    const res = await fetch("/api/deposits/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedLead.clientId })
    });
    if (res.ok) {
      setDepositStatus("success");
      return;
    }
    const data = await res.json().catch(() => ({}));
    setDepositStatus("error");
    setDepositError(data?.error || "Nie udało się wysłać linku.");
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <Card className="min-w-0">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input placeholder="Imię i nazwisko" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input placeholder="Instagram" value={form.igHandle} onChange={(e) => setForm({ ...form, igHandle: e.target.value })} />
          <select
            className="w-full rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-2 text-sm"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          >
            <option value="website">Strona</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="other">Inne</option>
          </select>
          <Input placeholder="Wiadomość" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        {error && <div className="mt-3 text-xs text-red-300">{error}</div>}
        <div className="mt-4 flex justify-end">
          <Button onClick={createLead} disabled={!form.name.trim() || saving}>
            {saving ? "Dodawanie..." : "Dodaj lead"}
          </Button>
        </div>
      </Card>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[2.2fr_1fr]">
        <div className="hidden min-w-0 gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
          {statuses.map((status) => (
            <Card
              key={status}
              className={`min-h-[320px] min-w-0 ${dragOver === status ? "border-accent-500/60" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(status);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(null);
                if (draggedId) {
                  updateStatus(draggedId, status).catch(() => undefined);
                  setDraggedId(null);
                }
              }}
            >
              <div className="text-sm uppercase text-ink-400">{statusLabels[status]}</div>
              <div className="mt-4 space-y-3">
                {loading && <div className="text-xs text-ink-400">Ładowanie...</div>}
                {!loading && grouped[status].length === 0 && (
                  <div className="text-xs text-ink-500">Brak leadów</div>
                )}
                {grouped[status].map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => setDraggedId(lead.id)}
                    onDragEnd={() => setDraggedId(null)}
                    onClick={() => openLead(lead)}
                    className={`cursor-pointer rounded-lg border p-3 text-sm transition break-words min-w-0 ${
                      selectedLead?.id === lead.id ? "border-accent-500/70 bg-ink-900" : "border-ink-700 hover:border-ink-500"
                    }`}
                  >
                    <div className="font-semibold">{lead.name}</div>
                    <div className="text-xs text-ink-400">{lead.source}</div>
                    {lead.message && <div className="mt-2 text-xs text-ink-200 line-clamp-2">{lead.message}</div>}
                    <select
                      className="mt-3 w-full max-w-full rounded-md border border-ink-700 bg-ink-900 px-2 py-1 text-xs"
                      value={lead.status}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                    >
                      {statuses.map((opt) => (
                        <option key={opt} value={opt}>{statusLabels[opt]}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <div className="space-y-4 md:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {statuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setMobileStatus(status)}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${
                  mobileStatus === status ? "border-accent-500 bg-ink-800/80 text-ink-100" : "border-ink-700 text-ink-300"
                }`}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {loading && <div className="text-xs text-ink-400">Ładowanie...</div>}
            {!loading && grouped[mobileStatus].length === 0 && (
              <div className="text-xs text-ink-500">Brak leadów</div>
            )}
            {grouped[mobileStatus].map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => openLead(lead)}
                className={`w-full min-w-0 rounded-xl border p-3 text-left text-sm break-words ${
                  selectedLead?.id === lead.id ? "border-accent-500/70 bg-ink-900" : "border-ink-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{lead.name}</div>
                  <select
                    className="max-w-full rounded-md border border-ink-700 bg-ink-900 px-2 py-1 text-[11px]"
                    value={lead.status}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                  >
                    {statuses.map((opt) => (
                      <option key={opt} value={opt}>{statusLabels[opt]}</option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-ink-400">{lead.source}</div>
                {lead.message && <div className="mt-2 text-xs text-ink-200 line-clamp-2">{lead.message}</div>}
              </button>
            ))}
          </div>
        </div>

        <Card className="min-h-[420px] min-w-0">
          <div className="text-sm text-ink-400">Szczegóły leada</div>
          {!selectedLead && (
            <div className="mt-4 text-xs text-ink-500">Wybierz leada z kolumny.</div>
          )}
          {selectedLead && (
            <>
              <div className="mt-4">
                <div className="text-lg font-semibold break-words">{selectedLead.name}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedLead.phone && (
                  <Button
                    variant="secondary"
                    onClick={() => (window.location.href = `tel:${selectedLead.phone}`)}
                  >
                    Zadzwoń
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={sendDepositLink}
                  disabled={!selectedLead.clientId || depositStatus === "sending"}
                >
                  {depositStatus === "sending" ? "Wysyłanie..." : "Wyślij link do zadatku"}
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-400">
                {depositLoading && <span>Ładowanie zadatku...</span>}
                {!depositLoading && depositSummary?.hasDeposit && (
                  <>
                    <span>Zadatek: {formatPLN(depositSummary.amount ?? 0)}</span>
                    <span className={depositSummary.status === "paid" ? "text-emerald-300" : "text-amber-300"}>
                      {depositStatusLabel(depositSummary.status)}
                    </span>
                  </>
                )}
                {!depositLoading && (!depositSummary || !depositSummary.hasDeposit) && (
                  <span>Zadatek: nieustawiony</span>
                )}
              </div>
              {depositStatus === "success" && (
                <div className="mt-2 text-xs text-emerald-300">Wysłano link do zadatku.</div>
              )}
                {depositStatus === "error" && depositError && (
                  <div className="mt-2 text-xs text-red-300">{depositError}</div>
                )}
              </div>

              <div className="mt-4 grid gap-3 text-sm">
                <div className="rounded-xl border border-ink-700 p-3">
                  <div className="text-xs text-ink-500">Status</div>
                  <div className="font-semibold">{statusLabels[selectedLead.status]}</div>
                </div>
                <div className="rounded-xl border border-ink-700 p-3">
                  <div className="text-xs text-ink-500">Źródło</div>
                  <div className="font-semibold break-words">{selectedLead.source}</div>
                </div>
                <div className="rounded-xl border border-ink-700 p-3">
                  <div className="text-xs text-ink-500">Email</div>
                  <div className="font-semibold break-words">{selectedLead.email || "Brak"}</div>
                </div>
                <div className="rounded-xl border border-ink-700 p-3">
                  <div className="text-xs text-ink-500">Telefon</div>
                  <div className="font-semibold break-words">{selectedLead.phone || "Brak"}</div>
                </div>
              </div>

              {selectedLead.message && (
                <div className="mt-4 rounded-xl border border-ink-700 p-4 text-sm">
                  <div className="text-xs text-ink-500">Wiadomość</div>
                  <div className="mt-2 break-words text-ink-100">{selectedLead.message}</div>
                </div>
              )}

              <div className="mt-6 grid gap-4">
                {selectedLead.email && (
                  <Card>
                    <div className="text-sm text-ink-400">Kontakt email</div>
                    <div className="mt-3 space-y-2">
                      <Input
                        placeholder="Temat"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                      />
                      <Textarea
                        rows={4}
                        placeholder="Treść wiadomości"
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                      />
                      <Button
                        onClick={() => sendLeadContact("email")}
                        disabled={contactStatus === "sending"}
                      >
                        Wyślij email
                      </Button>
                    </div>
                  </Card>
                )}

                {selectedLead.phone && (
                  <Card>
                    <div className="text-sm text-ink-400">Kontakt SMS</div>
                    <div className="mt-3 space-y-2">
                      <Textarea
                        rows={4}
                        placeholder="Treść SMS"
                        value={smsBody}
                        onChange={(e) => setSmsBody(e.target.value)}
                      />
                      <Button
                        onClick={() => sendLeadContact("sms")}
                        disabled={contactStatus === "sending"}
                      >
                        Wyślij SMS
                      </Button>
                    </div>
                  </Card>
                )}

                {(selectedLead.source === "instagram" || selectedLead.source === "facebook") && (
                  <Card>
                    <div className="text-sm text-ink-400">Kontakt przez wiadomość</div>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-ink-500">
                        Kanał: {selectedLead.source === "facebook" ? "Facebook" : "Instagram"}
                      </div>
                      <Textarea
                        rows={4}
                        placeholder="Treść wiadomości"
                        value={messageBody}
                        onChange={(e) => setMessageBody(e.target.value)}
                      />
                      <Button
                        onClick={sendLeadMessage}
                        disabled={contactStatus === "sending"}
                      >
                        Wyślij wiadomość
                      </Button>
                      <div className="text-[11px] text-ink-500">
                        Wymaga wcześniejszej wiadomości od klienta.
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {contactStatus === "success" && (
                <div className="mt-3 text-xs text-emerald-300">Wiadomość wysłana.</div>
              )}
              {contactStatus === "error" && contactError && (
                <div className="mt-3 text-xs text-red-300">{contactError}</div>
              )}
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={closeLead}>Wyczyść wybór</Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
