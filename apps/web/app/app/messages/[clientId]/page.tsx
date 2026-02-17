"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Message = {
  id: string;
  direction: "inbound" | "outbound";
  channel: "instagram" | "facebook" | "email" | "sms" | "other";
  body: string;
  createdAt: string;
};

type Client = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  messages: Message[];
};

type DepositSummary = {
  hasDeposit: boolean;
  amount?: number;
  status?: "none" | "pending" | "paid" | "expired";
  startsAt?: string;
};

export default function MessageThreadPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/clients/${clientId}`);
    if (!res.ok) {
      setLoading(false);
      setClient(null);
      return;
    }
    const data = (await res.json()) as Client;
    setClient(data);
    setLoading(false);
  };

  useEffect(() => {
    if (clientId) {
      load().catch(() => setLoading(false));
      const interval = window.setInterval(() => {
        load().catch(() => undefined);
      }, 1000);
      return () => window.clearInterval(interval);
    }
    return undefined;
  }, [clientId]);

  useEffect(() => {
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
  }, [clientId]);

  const lastInboundChannel = useMemo(() => {
    if (!client) return null;
    const ordered = [...client.messages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const inbound = ordered.find((msg) => msg.direction === "inbound");
    return inbound?.channel || null;
  }, [client]);

  const channelLabel = lastInboundChannel === "instagram"
    ? "Instagram"
    : lastInboundChannel === "facebook"
    ? "Facebook"
    : "auto";

  const sendReply = async () => {
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    setActionStatus(null);
    const res = await fetch("/api/messages/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, body })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Nie udało się wysłać wiadomości.");
      setSending(false);
      return;
    }
    setBody("");
    setSending(false);
    await load();
  };

  if (loading) {
    return <div className="text-sm text-ink-400">Ładowanie...</div>;
  }

  if (!client) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-ink-400">Nie znaleziono klienta.</div>
        <Button variant="secondary" onClick={() => router.push("/app/messages")}>Wróć</Button>
      </div>
    );
  }

  const ordered = [...client.messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display md:text-3xl">Wątek: {client.name}</h1>
        <p className="text-xs text-ink-400">
          Odpowiedź zostanie wysłana przez: {channelLabel}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {client.phone && (
            <Button
              variant="secondary"
              onClick={() => (window.location.href = `tel:${client.phone}`)}
            >
              Zadzwoń
            </Button>
          )}
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
    </div>

      <Card>
        <div className="space-y-3">
          {ordered.length === 0 && <div className="text-xs text-ink-500">Brak wiadomości.</div>}
          {ordered.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] rounded-2xl border p-3 text-sm ${
                msg.direction === "outbound"
                  ? "ml-auto border-accent-500/60 bg-accent-500/20"
                  : "border-ink-700 bg-ink-900/70"
              }`}
            >
              <div className="text-[11px] text-ink-400">
                {msg.direction === "outbound" ? "Ty" : "Klient"} · {msg.channel} · {new Date(msg.createdAt).toLocaleString("pl-PL")}
              </div>
              <div className="mt-2 text-ink-100">{msg.body}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="text-sm text-ink-400">Odpowiedz klientowi</div>
        <div className="mt-3">
          <Textarea
            rows={4}
            placeholder="Wpisz odpowiedź..."
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </div>
        {error && <div className="mt-2 text-xs text-red-300">{error}</div>}
        <div className="mt-3 flex justify-end">
          <Button onClick={sendReply} disabled={sending || !body.trim()}>
            {sending ? "Wysyłanie..." : "Wyślij"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
