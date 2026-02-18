"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Channel = "email" | "sms" | "instagram" | "facebook";

type Client = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  igUserId?: string | null;
  fbUserId?: string | null;
};

type Message = {
  id: string;
  direction: "inbound" | "outbound";
  channel: Channel;
  body: string;
  createdAt: string;
  client: Client;
};

type DepositSummary = {
  hasDeposit: boolean;
  amount?: number;
  status?: "none" | "pending" | "paid" | "expired";
  startsAt?: string;
};

export function MessagesBoard() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [replyBody, setReplyBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [sendingDeposit, setSendingDeposit] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [depositSummary, setDepositSummary] = useState<DepositSummary | null>(null);
  const [depositLoading, setDepositLoading] = useState(false);

  const load = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    const [messagesRes, clientsRes] = await Promise.all([fetch("/api/messages"), fetch("/api/clients")]);
    const [messagesData, clientsData] = await Promise.all([messagesRes.json(), clientsRes.json()]);
    setMessages(messagesData as Message[]);
    setClients(clientsData as Client[]);
    if (!silent) {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
    const interval = window.setInterval(() => {
      load(true).catch(() => undefined);
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

  const goToReminder = () => {
    if (!selectedClient) return;
    const text = `Napisz do ${selectedClient.name}`;
    const params = new URLSearchParams({ clientId: selectedClient.id, text });
    router.push(`/app/calendar?${params.toString()}`);
  };

  const formatPLN = (value: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);

  const extractFirstUrl = (value: string) => {
    const match = value.match(/https?:\/\/\S+/i);
    return match ? match[0] : null;
  };

  const isImageUrl = (value: string) => {
    const lower = value.toLowerCase().trim();
    return (
      lower.startsWith("http") &&
      (lower.includes("fbcdn.net") ||
        lower.includes("fbsbx.com") ||
        lower.includes("cdninstagram.com") ||
        lower.match(/\.(png|jpe?g|webp|gif)$/))
    );
  };

  const formatPreview = (value: string) => {
    const trimmed = value.trim();
    const url = extractFirstUrl(trimmed);
    if (url && isImageUrl(url)) return "📷 Zdjęcie";
    if (url) return "🔗 Link";
    return value;
  };

  const renderBody = (value: string) => {
    const trimmed = value.trim();
    const url = extractFirstUrl(trimmed);
    if (url && isImageUrl(url)) {
      return (
        <img
          src={url}
          alt="Załącznik"
          className="mt-2 max-h-72 w-full rounded-xl object-contain"
        />
      );
    }
    if (url) {
      return (
        <a href={url} target="_blank" rel="noreferrer" className="break-all text-accent-400">
          {url}
        </a>
      );
    }
    return <span className="text-ink-100">{value}</span>;
  };

  const depositStatusLabel = (status?: DepositSummary["status"]) => {
    if (status === "paid") return "Wpłacony";
    return "Nieopłacony";
  };

  const threads = useMemo(() => {
    const map = new Map<string, { client: Client; messages: Message[] }>();
    messages.forEach((msg) => {
      const existing = map.get(msg.client.id);
      if (existing) {
        existing.messages.push(msg);
      } else {
        map.set(msg.client.id, { client: msg.client, messages: [msg] });
      }
    });

    const list = Array.from(map.values()).map((thread) => {
      const ordered = [...thread.messages].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const lastMessage = ordered[0];
      const lastInbound = ordered.find((msg) => msg.direction === "inbound");
      const lastOutbound = ordered.find((msg) => msg.direction === "outbound");
      const needsReply = Boolean(
        lastInbound &&
          (!lastOutbound ||
            new Date(lastOutbound.createdAt).getTime() < new Date(lastInbound.createdAt).getTime())
      );
      return { client: thread.client, lastMessage, needsReply };
    });

    return list.sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }, [messages]);

  useEffect(() => {
    if (!selectedClientId && threads.length > 0) {
      setSelectedClientId(threads[0].client.id);
    }
  }, [threads, selectedClientId]);

  useEffect(() => {
    const clientId = selectedClient?.id;
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
  }, [selectedClient?.id]);

  const selectedMessages = selectedClient
    ? messages
        .filter((msg) => msg.client.id === selectedClient.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  const lastInbound = useMemo(() => {
    if (!selectedMessages.length) return null;
    for (let i = selectedMessages.length - 1; i >= 0; i -= 1) {
      if (selectedMessages[i].direction === "inbound") {
        return selectedMessages[i];
      }
    }
    return null;
  }, [selectedMessages]);

  const replyChannel = lastInbound?.channel || null;
  const replyChannelLabel =
    replyChannel === "instagram"
      ? "Instagram"
      : replyChannel === "facebook"
      ? "Facebook"
      : replyChannel === "email"
      ? "Email"
      : replyChannel === "sms"
      ? "SMS"
      : "—";

  const sendDepositLink = async () => {
    if (!selectedClient) return;
    setSendingDeposit(true);
    setActionStatus(null);
    const res = await fetch("/api/deposits/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClient.id })
    });
    if (res.ok) {
      setActionStatus("Wysłano link do zadatku.");
    } else {
      const data = await res.json().catch(() => ({}));
      setActionStatus(data?.error || "Nie udało się wysłać linku.");
    }
    setSendingDeposit(false);
  };

  const sendReply = async () => {
    if (!selectedClient || !replyChannel) {
      setActionStatus("Nie można ustalić kanału odpowiedzi.");
      return;
    }
    if (!replyBody.trim()) return;
    const optimisticBody = replyBody.trim();
    setSendingReply(true);
    setActionStatus(null);
    const optimisticMessage: Message = {
      id: `optimistic-${Date.now()}`,
      direction: "outbound",
      channel: replyChannel,
      body: optimisticBody,
      createdAt: new Date().toISOString(),
      client: selectedClient
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setReplyBody("");
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          channel: replyChannel,
          body: optimisticBody
        })
      });
      if (res.ok) {
        setActionStatus("Wiadomość wysłana.");
        await load(true).catch(() => undefined);
        return;
      }
      const data = await res.json().catch(() => ({}));
      setActionStatus(data?.error || "Nie udało się wysłać wiadomości.");
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="hidden space-y-3 lg:block">
        <div className="text-xs text-ink-400">Wątki</div>
        {loading && <div className="text-xs text-ink-400">Ładowanie...</div>}
        {!loading && threads.length === 0 && <div className="text-xs text-ink-500">Brak wiadomości</div>}
        {threads.map((thread) => (
          <button
            key={thread.client.id}
            onClick={() => setSelectedClientId(thread.client.id)}
            className={`w-full rounded-xl border p-3 text-left text-sm transition ${
              selectedClientId === thread.client.id ? "border-accent-500/70 bg-ink-900" : "border-ink-700"
            } ${thread.needsReply ? "border-red-500/70 bg-red-500/10" : ""}`}
          >
            <div className="font-semibold">{thread.client.name}</div>
            <div className="text-xs text-ink-400">{thread.lastMessage.channel}</div>
            <div className="mt-2 break-words text-xs text-ink-200 line-clamp-2">
              {formatPreview(thread.lastMessage.body)}
            </div>
            {thread.needsReply && <div className="mt-2 text-xs text-red-300">Brak odpowiedzi</div>}
          </button>
        ))}
      </Card>

      <Card className="hidden min-h-[520px] lg:block">
        <div className="flex items-center justify-between">
          <div className="text-sm text-ink-400">Wątek</div>
          {selectedClient && (
            <Link className="text-xs text-accent-400" href={`/app/messages/${selectedClient.id}`}>
              Otwórz pełny wątek →
            </Link>
          )}
        </div>

        {!selectedClient && (
          <div className="mt-6 text-xs text-ink-500">Wybierz wątek z listy po lewej.</div>
        )}

        {selectedClient && (
          <>
            <div className="mt-4">
              <div className="text-lg font-semibold">{selectedClient.name}</div>
              <div className="mt-1 text-xs text-ink-400">
                Odpowiedź zostanie wysłana przez: {replyChannelLabel}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedClient.phone && (
                  <Button
                    variant="secondary"
                    onClick={() => (window.location.href = `tel:${selectedClient.phone}`)}
                  >
                    Zadzwoń
                  </Button>
                )}
                <Button variant="secondary" onClick={goToReminder}>
                  Ustaw przypomnienie
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
              {actionStatus && <div className="mt-2 text-xs text-ink-400">{actionStatus}</div>}
            </div>

            <div className="mt-6 space-y-3">
              {selectedMessages.length === 0 && (
                <div className="text-xs text-ink-500">Brak wiadomości.</div>
              )}
              {selectedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] rounded-2xl border p-3 text-sm ${
                    msg.direction === "outbound"
                      ? "ml-auto border-accent-500/60 bg-accent-500/20"
                      : "border-ink-700 bg-ink-900/70"
                  }`}
                >
                  <div className="text-[11px] text-ink-400">
                    {msg.direction === "outbound" ? "Ty" : "Klient"} · {msg.channel} ·{" "}
                    {new Date(msg.createdAt).toLocaleString("pl-PL")}
                  </div>
                  <div className="mt-2">{renderBody(msg.body)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-ink-700 bg-ink-900/40 p-4">
              <div className="space-y-3">
                <div className="text-xs text-ink-500">
                  Kanał odpowiedzi: {replyChannelLabel}
                </div>
                <Textarea
                  rows={3}
                  placeholder="Treść wiadomości"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                />
                {!replyChannel && (
                  <div className="text-[11px] text-ink-500">
                    Nie można ustalić kanału odpowiedzi — brak wiadomości przychodzącej.
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={sendReply} disabled={!replyBody.trim() || sendingReply || !replyChannel}>
                  {sendingReply ? "Wysyłanie..." : "Wyślij wiadomość"}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
      <Card className="lg:hidden">
        <div className="text-sm text-ink-400">Wątki</div>
        <div className="mt-4 space-y-3">
          {loading && <div className="text-xs text-ink-400">Ładowanie...</div>}
          {!loading && threads.length === 0 && <div className="text-xs text-ink-500">Brak wiadomości</div>}
          {threads.map((thread) => (
            <Link
              key={thread.client.id}
              href={`/app/messages/${thread.client.id}`}
              className={`block rounded-xl border p-3 text-sm ${
                thread.needsReply ? "border-red-500/70 bg-red-500/10" : "border-ink-700"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold">{thread.client.name}</div>
                <div className="text-[11px] text-ink-500">
                  {new Date(thread.lastMessage.createdAt).toLocaleDateString("pl-PL")}
                </div>
              </div>
              <div className="text-xs text-ink-400">{thread.lastMessage.channel}</div>
              <div className="mt-2 break-words text-xs text-ink-200 line-clamp-2">
                {formatPreview(thread.lastMessage.body)}
              </div>
              {thread.needsReply && <div className="mt-2 text-[11px] text-red-300">Brak odpowiedzi</div>}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
