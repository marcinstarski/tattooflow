"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Appointment = {
  id: string;
  startsAt: string;
  depositStatus: "none" | "pending" | "paid" | "expired";
  depositAmount?: number | null;
  depositLink?: string | null;
  client: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  artist: {
    name: string;
  };
};

const statusLabel = (status: Appointment["depositStatus"]) =>
  status === "paid" ? "Wpłacony" : "Nieopłacony";

export function DepositsBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const formatPLN = (value: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit" }).format(new Date(value));

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/deposits");
    if (res.ok) {
      setAppointments((await res.json()) as Appointment[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const sendLink = async (appointmentId: string) => {
    setSendingId(appointmentId);
    setStatus(null);
    const res = await fetch("/api/deposits/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId })
    });
    if (res.ok) {
      setStatus("Link wysłany.");
      await load();
    } else {
      const data = await res.json().catch(() => ({}));
      setStatus(data?.error || "Nie udało się wysłać linku.");
    }
    setSendingId(null);
  };

  const togglePaid = async (appointment: Appointment) => {
    setUpdatingId(appointment.id);
    setStatus(null);
    const nextPaid = appointment.depositStatus !== "paid";
    const res = await fetch(`/api/appointments/${appointment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        depositStatus: nextPaid ? "paid" : "pending",
        depositPaidAt: nextPaid ? new Date().toISOString() : null
      })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus(data?.error || "Nie udało się zmienić statusu.");
    } else {
      await load();
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-4 text-sm">
      {loading && <div className="text-xs text-ink-400">Ładowanie...</div>}
      {!loading && appointments.length === 0 && (
        <div className="text-xs text-ink-500">Brak zadatków.</div>
      )}
      {appointments.map((appointment) => {
        const amount = appointment.depositAmount ?? 0;
        const amountLabel = amount > 0 ? formatPLN(amount) : "—";
        const statusText = statusLabel(appointment.depositStatus);
        return (
          <div
            key={appointment.id}
            className="rounded-2xl border border-ink-700 bg-ink-900/60 px-6 py-4 shadow-soft"
          >
            <div className="hidden items-center gap-4 md:grid md:grid-cols-[1.6fr_0.7fr_0.7fr_auto]">
              <div>
                <div className="text-lg font-semibold">{appointment.client.name}</div>
                <div className="text-xs text-ink-400">
                  {formatDate(appointment.startsAt)} · {formatTime(appointment.startsAt)}
                </div>
              </div>
              <div className="text-lg font-semibold">{amountLabel}</div>
              <div className="space-y-1">
                <div className={statusText === "Wpłacony" ? "text-emerald-300" : "text-amber-300"}>
                  {statusText}
                </div>
                <button
                  className="text-xs text-ink-400 transition hover:text-ink-100"
                  onClick={() => togglePaid(appointment)}
                  disabled={updatingId === appointment.id}
                >
                  {updatingId === appointment.id
                    ? "Aktualizacja..."
                    : appointment.depositStatus === "paid"
                    ? "Oznacz jako nieopłacony"
                    : "Oznacz jako opłacony"}
                </button>
              </div>
              <div className="flex justify-start md:justify-end">
                <Button onClick={() => sendLink(appointment.id)} disabled={sendingId === appointment.id}>
                  {sendingId === appointment.id ? "Wysyłanie..." : "Wyślij link"}
                </Button>
              </div>
            </div>
            <div className="space-y-3 md:hidden">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{appointment.client.name}</div>
                  <div className="text-xs text-ink-400">
                    {formatDate(appointment.startsAt)} · {formatTime(appointment.startsAt)}
                  </div>
                </div>
                <div className="text-lg font-semibold">{amountLabel}</div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className={statusText === "Wpłacony" ? "text-emerald-300" : "text-amber-300"}>
                  {statusText}
                </div>
                <button
                  className="text-xs text-ink-400 transition hover:text-ink-100"
                  onClick={() => togglePaid(appointment)}
                  disabled={updatingId === appointment.id}
                >
                  {updatingId === appointment.id
                    ? "Aktualizacja..."
                    : appointment.depositStatus === "paid"
                    ? "Oznacz jako nieopłacony"
                    : "Oznacz jako opłacony"}
                </button>
              </div>
              <Button onClick={() => sendLink(appointment.id)} disabled={sendingId === appointment.id} className="w-full">
                {sendingId === appointment.id ? "Wysyłanie..." : "Wyślij link"}
              </Button>
            </div>
          </div>
        );
      })}
      {status && <div className="text-xs text-ink-400">{status}</div>}
    </div>
  );
}
