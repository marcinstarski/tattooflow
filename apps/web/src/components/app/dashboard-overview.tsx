"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addDays, format, isAfter, isBefore, startOfWeek } from "date-fns";
import { pl } from "date-fns/locale";

type Artist = { id: string; name: string };

type Lead = {
  id: string;
  status: string;
  createdAt: string;
};

type Appointment = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  depositStatus: string;
  depositAmount?: number | null;
  client: { name: string };
  artist: { name: string; id: string };
};

export function DashboardOverview() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState<string>("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const artistRes = await fetch("/api/artists");
    const artistsData = (await artistRes.json()) as Artist[];
    setArtists(artistsData);
    if (!selectedArtistId && artistsData.length === 1) {
      setSelectedArtistId(artistsData[0].id);
    }

    const params = new URLSearchParams();
    if (selectedArtistId) {
      params.set("artistId", selectedArtistId);
    }

    const [leadsRes, appointmentsRes] = await Promise.all([
      fetch("/api/leads"),
      fetch(`/api/appointments?${params.toString()}`)
    ]);

    setLeads((await leadsRes.json()) as Lead[]);
    setAppointments((await appointmentsRes.json()) as Appointment[]);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [selectedArtistId]);

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, idx) => addDays(weekStart, idx));

  const stats = useMemo(() => {
    const last7 = addDays(today, -7);
    const leadsNew = leads.filter((lead) => new Date(lead.createdAt) >= last7).length;
    const upcoming = appointments.filter((appt) => isAfter(new Date(appt.startsAt), today)).length;
    const pendingDeposits = appointments.filter((appt) => appt.depositStatus === "pending").length;
    return {
      leadsNew,
      upcoming,
      pendingDeposits
    };
  }, [leads, appointments, today]);

  const upcomingAppointments = appointments
    .filter((appt) => isAfter(new Date(appt.startsAt), today))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-display md:text-3xl">Dashboard</h1>
          <p className="text-sm text-ink-300">Najważniejsze informacje w jednym miejscu.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-xs text-ink-400">Użytkownik:</span>
          <select
            className="rounded-xl border border-ink-700 bg-ink-900/70 px-3 py-2 text-sm"
            value={selectedArtistId}
            onChange={(e) => setSelectedArtistId(e.target.value)}
          >
            <option value="">Wszyscy</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>{artist.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <div className="text-sm text-ink-400">Nowe leady (7 dni)</div>
          <div className="mt-3 text-3xl font-display">{stats.leadsNew}</div>
        </Card>
        <Card>
          <div className="text-sm text-ink-400">Nadchodzące wizyty</div>
          <div className="mt-3 text-3xl font-display">{stats.upcoming}</div>
        </Card>
        <Card>
          <div className="text-sm text-ink-400">Zadatki w toku</div>
          <div className="mt-3 text-3xl font-display">{stats.pendingDeposits}</div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-ink-400">Kalendarz tygodnia</div>
            <Button variant="secondary" onClick={() => window.location.href = "/app/calendar"}>Pełny kalendarz</Button>
          </div>
          <div className="mt-4 hidden gap-3 md:grid md:grid-cols-7">
            {days.map((day) => {
              const dayAppointments = appointments.filter((appt) => {
                const starts = new Date(appt.startsAt);
                return starts.toDateString() === day.toDateString();
              });
              return (
                <div key={day.toISOString()} className="rounded-xl border border-ink-700 p-3 text-xs">
                  <div className="text-ink-300">{format(day, "EEE dd.MM", { locale: pl })}</div>
                  <div className="mt-2 space-y-2">
                    {dayAppointments.length === 0 && (
                      <div className="text-ink-500">Brak wizyt</div>
                    )}
                    {dayAppointments.map((appt) => (
                      <div key={appt.id} className="rounded-lg border border-ink-700 px-2 py-1">
                        <div className="font-semibold">{format(new Date(appt.startsAt), "HH:mm", { locale: pl })}</div>
                        <div className="text-ink-400">{appt.client.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 space-y-3 md:hidden">
            {days.map((day) => {
              const dayAppointments = appointments.filter((appt) => {
                const starts = new Date(appt.startsAt);
                return starts.toDateString() === day.toDateString();
              });
              return (
                <div key={day.toISOString()} className="rounded-xl border border-ink-700 p-3 text-sm">
                  <div className="text-xs text-ink-400">{format(day, "EEEE dd.MM", { locale: pl })}</div>
                  <div className="mt-2 space-y-2">
                    {dayAppointments.length === 0 && (
                      <div className="text-xs text-ink-500">Brak wizyt</div>
                    )}
                    {dayAppointments.map((appt) => (
                      <div key={appt.id} className="rounded-lg border border-ink-700 px-3 py-2">
                        <div className="font-semibold">{format(new Date(appt.startsAt), "HH:mm", { locale: pl })}</div>
                        <div className="text-xs text-ink-400">{appt.client.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="text-sm text-ink-400">Najbliższe wizyty</div>
          <div className="mt-4 space-y-3">
            {loading && <div className="text-xs text-ink-400">Ładowanie...</div>}
            {!loading && upcomingAppointments.length === 0 && (
              <div className="text-xs text-ink-500">Brak nadchodzących wizyt.</div>
            )}
            {upcomingAppointments.map((appt) => (
              <div key={appt.id} className="rounded-xl border border-ink-700 p-3 text-sm">
                <div className="font-semibold">{appt.client.name}</div>
                <div className="text-xs text-ink-400">{format(new Date(appt.startsAt), "dd.MM HH:mm", { locale: pl })} · {appt.artist.name}</div>
                <div className="text-xs text-ink-500">Status: {appt.status}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
