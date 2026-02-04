"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type IntegrationStatus = {
  configured: boolean;
  status: string;
  pageName: string | null;
  pageId: string | null;
  igBusinessAccountId: string | null;
  connectedAt: string | null;
  hasToken: boolean;
  webhookUrl: string;
  redirectUri: string;
};

type MetaPage = {
  id: string;
  name: string;
  instagramBusinessAccountId: string | null;
};

export function MetaConnectCard() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [pages, setPages] = useState<MetaPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/integrations/instagram/status");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Brak profilu artysty.");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as IntegrationStatus;
      setStatus(data);
      if (data.hasToken && !data.pageId) {
        const pagesRes = await fetch("/api/integrations/instagram/pages");
        if (pagesRes.ok) {
          const pagesData = (await pagesRes.json()) as MetaPage[];
          setPages(pagesData);
        }
      } else {
        setPages([]);
      }
    } catch {
      setError("Nie udało się pobrać statusu.");
    }
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const startConnect = async () => {
    setError(null);
    const res = await fetch("/api/integrations/instagram/auth-url", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Nie udało się rozpocząć połączenia.");
      return;
    }
    window.location.href = data.url as string;
  };

  const selectPage = async (pageId: string) => {
    setError(null);
    const res = await fetch("/api/integrations/instagram/select-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId })
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data?.error || "Nie udało się połączyć strony.");
      return;
    }
    await load();
  };

  const disconnect = async () => {
    await fetch("/api/integrations/instagram/disconnect", { method: "POST" });
    await load();
  };

  const statusLabel = (() => {
    if (!status) return "--";
    if (!status.configured) return "Nieaktywne";
    if (status.status === "connected") return "Połączono";
    if (status.hasToken && !status.pageId) return "Wybierz stronę";
    return "Rozłączono";
  })();

  const facebookConnected = Boolean(status?.pageId);
  const instagramConnected = Boolean(status?.igBusinessAccountId);

  return (
    <Card>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-sm text-ink-400">Integracje</div>
          <h2 className="text-lg font-semibold">Meta (Instagram + Facebook)</h2>
          <p className="text-xs text-ink-500">
            Połącz konto Meta, aby wiadomości z IG i Messengera wpadały do CRM.
          </p>
        </div>
        <div className="text-xs text-ink-400">Status: {statusLabel}</div>
      </div>

      {loading && <div className="mt-4 text-xs text-ink-500">Ładowanie...</div>}

      {!loading && status && !status.configured && (
        <div className="mt-4 rounded-xl border border-ink-700 bg-ink-900/60 p-3 text-xs text-ink-300">
          Integracja nie jest skonfigurowana. Ustaw `META_APP_ID`, `META_APP_SECRET` i
          `META_WEBHOOK_VERIFY_TOKEN` w `.env`, a potem uruchom ponownie serwer.
        </div>
      )}

      {!loading && status?.configured && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="text-xs text-ink-400">Webhook URL</div>
            <div className="mt-1 flex gap-2">
              <Input value={status.webhookUrl} readOnly />
              <Button
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(status.webhookUrl)}
              >
                Kopiuj
              </Button>
            </div>
          </div>
          <div>
            <div className="text-xs text-ink-400">Redirect URI</div>
            <div className="mt-1 flex gap-2">
              <Input value={status.redirectUri} readOnly />
              <Button
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(status.redirectUri)}
              >
                Kopiuj
              </Button>
            </div>
          </div>

          {status.status === "connected" && (
            <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-3 text-xs text-ink-300">
              Połączono ze stroną: <span className="text-ink-100">{status.pageName || status.pageId}</span>.
            </div>
          )}

          <div className="grid gap-2 text-xs text-ink-400 md:grid-cols-2">
            <div className="rounded-xl border border-ink-700 p-3">
              Facebook Messenger: {facebookConnected ? "połączono" : "niepołączono"}
            </div>
            <div className="rounded-xl border border-ink-700 p-3">
              Instagram DM: {instagramConnected ? "połączono" : "niepołączono"}
            </div>
          </div>

          {error && <div className="text-xs text-red-300">{error}</div>}

          {status.status === "disconnected" && (
            <Button onClick={startConnect}>Połącz Instagram i Facebook</Button>
          )}

          {status.hasToken && !status.pageId && (
            <div className="space-y-2">
              <div className="text-xs text-ink-400">Wybierz stronę Facebook</div>
              <div className="grid gap-2 md:grid-cols-2">
                {pages.map((page) => (
                  <div key={page.id} className="rounded-xl border border-ink-700 p-3 text-xs">
                    <div className="font-semibold text-ink-100">{page.name}</div>
                    <div className="text-[11px] text-ink-500">
                      {page.instagramBusinessAccountId ? "Ma IG Business" : "Brak IG Business"}
                    </div>
                    <div className="mt-2">
                      <Button variant="secondary" onClick={() => selectPage(page.id)}>
                        Połącz tę stronę
                      </Button>
                    </div>
                  </div>
                ))}
                {pages.length === 0 && (
                  <div className="text-xs text-ink-500">Nie znaleziono stron.</div>
                )}
              </div>
            </div>
          )}

          {status.status === "connected" && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={disconnect}>Odłącz</Button>
              <Button onClick={startConnect}>Połącz ponownie</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
