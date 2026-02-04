"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Artist = { id: string; name: string };

type Client = { id: string; name: string };

type Appointment = {
  id: string;
  startsAt: string;
  endsAt: string;
  description?: string | null;
  status: string;
  depositRequired: boolean;
  depositStatus: string;
  depositAmount?: number | null;
  depositLink?: string | null;
  client: Client;
  artist: Artist;
};

type FormState = {
  clientId: string;
  artistId: string;
  date: string;
  time: string;
  price: string;
  description: string;
  depositRequired: boolean;
  depositAmount: string;
  depositDueDays: string;
};

const emptyForm: FormState = {
  clientId: "",
  artistId: "",
  date: "",
  time: "",
  price: "",
  description: "",
  depositRequired: false,
  depositAmount: "200",
  depositDueDays: "7"
};

export function CalendarBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [appointmentsRes, clientsRes, artistsRes] = await Promise.all([
      fetch("/api/appointments"),
      fetch("/api/clients"),
      fetch("/api/artists")
    ]);
    const [appointmentsData, clientsData, artistsData] = await Promise.all([
      appointmentsRes.json(),
      clientsRes.json(),
      artistsRes.json()
    ]);
    setAppointments(appointmentsData as Appointment[]);
    setClients(clientsData as Client[]);
    setArtists(artistsData as Artist[]);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const createAppointment = async () => {
    if (!form.clientId || !form.artistId || !form.date || !form.time) return;
    const startsAt = new Date(`${form.date}T${form.time}:00`);
    const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
    const depositDueAt = form.depositRequired
      ? new Date(startsAt.getTime() - Number(form.depositDueDays || 7) * 24 * 60 * 60 * 1000)
      : undefined;

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: form.clientId,
        artistId: form.artistId,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        description: form.description || undefined,
        price: form.price ? Number(form.price) : undefined,
        depositRequired: form.depositRequired,
        depositAmount: form.depositRequired ? Number(form.depositAmount || 0) : undefined,
        depositDueAt: depositDueAt ? depositDueAt.toISOString() : undefined
      })
    });
    if (res.ok) {
      setForm(emptyForm);
      await load();
    }
  };

  const createDepositLink = async (appointmentId: string) => {
    await fetch("/api/deposits/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId })
    });
    await load();
  };

  const sendReminder = async (appointmentId: string) => {
    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, channel: "sms" })
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <select
            className="w-full rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-2 text-sm"
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
          >
            <option value="">Wybierz klienta</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          <select
            className="w-full rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-2 text-sm"
            value={form.artistId}
            onChange={(e) => setForm({ ...form, artistId: e.target.value })}
          >
            <option value="">Wybierz artystę</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>{artist.name}</option>
            ))}
          </select>
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <select
            className="w-full rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-2 text-sm"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          >
            <option value="">Wybierz godzinę</option>
            {Array.from({ length: 24 }).map((_, idx) => {
              const value = `${String(idx).padStart(2, "0")}:00`;
              return (
                <option key={value} value={value}>
                  {value}
                </option>
              );
            })}
          </select>
          <Input placeholder="Cena (PLN)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Input placeholder="Opis" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="flex items-center gap-2 text-xs text-ink-300">
            <input
              type="checkbox"
              checked={form.depositRequired}
              onChange={(e) => setForm({ ...form, depositRequired: e.target.checked })}
            />
            Zadatek wymagany
          </label>
          {form.depositRequired && (
            <>
              <Input placeholder="Kwota zadatku" value={form.depositAmount} onChange={(e) => setForm({ ...form, depositAmount: e.target.value })} />
            </>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={createAppointment}>Dodaj wizytę</Button>
        </div>
      </Card>

      <Card>
        <div className="text-sm text-ink-400">Wizyty</div>
        <div className="mt-4 grid gap-3">
          {loading && <div className="text-xs text-ink-400">Ładowanie...</div>}
          {!loading && appointments.length === 0 && <div className="text-xs text-ink-500">Brak wizyt</div>}
          {appointments.map((appointment) => (
            <div key={appointment.id} className="rounded-xl border border-ink-700 p-4 text-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">
                    {appointment.client.name} · {appointment.artist.name}
                  </div>
                  <div className="text-xs text-ink-400">
                    {new Date(appointment.startsAt).toLocaleString("pl-PL")} - {new Date(appointment.endsAt).toLocaleTimeString("pl-PL")}
                  </div>
                  <div className="text-xs text-ink-500">Status: {appointment.status}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    className="rounded-lg border border-ink-700 px-3 py-1 text-xs"
                    href={`/api/appointments/${appointment.id}/ics`}
                  >
                    Export ICS
                  </a>
                  <Button variant="secondary" onClick={() => sendReminder(appointment.id)}>
                    Przypomnienie
                  </Button>
                  {appointment.depositRequired && (
                    <Button onClick={() => createDepositLink(appointment.id)}>
                      {appointment.depositLink ? "Odśwież link" : "Wygeneruj zadatek"}
                    </Button>
                  )}
                </div>
              </div>
              {appointment.depositRequired && (
                <div className="mt-2 text-xs text-ink-300">
                  Zadatek: {appointment.depositStatus} · {appointment.depositAmount || 0} PLN
                  {appointment.depositLink && (
                    <span className="ml-2">Link: {appointment.depositLink}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
