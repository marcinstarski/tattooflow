"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { pl } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


type Artist = { id: string; name: string };

type Client = { id: string; name: string };

type Appointment = {
  id: string;
  startsAt: string;
  endsAt: string;
  depositStatus?: "none" | "pending" | "paid" | "expired";
  depositRequired?: boolean;
  depositAmount?: number | null;
  client: Client;
  artist: Artist;
};

export function CalendarFull() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month">("week");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [artistId, setArtistId] = useState("");
  const [clientId, setClientId] = useState("");
  const [newClientMode, setNewClientMode] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", igHandle: "" });
  const [time, setTime] = useState("10:00");
  const [description, setDescription] = useState("");
  const [depositPaid, setDepositPaid] = useState(false);
  const [depositAmount, setDepositAmount] = useState("200");
  const depositAmountNumber = Number(depositAmount || 0);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDepositPaid, setEditDepositPaid] = useState(false);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const result: Date[] = [];
    let date = start;
    while (date <= end) {
      result.push(date);
      date = addDays(date, 1);
    }
    return result;
  }, [currentMonth]);

  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }).map((_, idx) => addDays(weekStart, idx)),
    [weekStart]
  );

  const load = async () => {
    const [artistRes, clientRes] = await Promise.all([fetch("/api/artists"), fetch("/api/clients")]);
    const artistsData = (await artistRes.json()) as Artist[];
    setArtists(artistsData);
    if (!artistId && artistsData.length === 1) {
      setArtistId(artistsData[0].id);
    }
    setClients((await clientRes.json()) as Client[]);

    const from = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }).toISOString();
    const to = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }).toISOString();
    const params = new URLSearchParams({ from, to });
    if (artistId) params.set("artistId", artistId);
    const apptRes = await fetch(`/api/appointments?${params.toString()}`);
    setAppointments((await apptRes.json()) as Appointment[]);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [currentMonth, artistId, selectedDate]);

  const createAppointment = async () => {
    let finalClientId = clientId;
    if (newClientMode) {
      if (!newClient.name) return;
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient)
      });
      const created = await res.json();
      finalClientId = created.id;
    }

    if (!finalClientId || !artistId) return;

    const startsAt = new Date(
      `${format(selectedDate, "yyyy-MM-dd")}T${time}:00`
    );
    const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
    const depositRequired = depositAmountNumber > 0;
    const depositPaidEffective = depositRequired && depositPaid;
    const depositDueAt = depositRequired
      ? new Date(startsAt.getTime() - 7 * 24 * 60 * 60 * 1000)
      : undefined;

    await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: finalClientId,
        artistId,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        description,
        depositRequired,
        depositAmount: depositRequired ? depositAmountNumber : undefined,
        depositDueAt: depositDueAt ? depositDueAt.toISOString() : undefined,
        depositPaid: depositPaidEffective
      })
    });

    setDescription("");
    setClientId("");
    setNewClientMode(false);
    setNewClient({ name: "", email: "", phone: "", igHandle: "" });
    setDepositPaid(false);
    await load();
  };

  const appointmentsByDay = useMemo(() => {
    return appointments.reduce<Record<string, Appointment[]>>((acc, appt) => {
      const key = format(new Date(appt.startsAt), "yyyy-MM-dd");
      acc[key] = acc[key] || [];
      acc[key].push(appt);
      return acc;
    }, {});
  }, [appointments]);

  const selectedKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDayAppointments = appointmentsByDay[selectedKey] || [];
  const selectedAppointment = selectedAppointmentId
    ? appointments.find((appt) => appt.id === selectedAppointmentId) || null
    : null;

  useEffect(() => {
    if (!selectedAppointment) {
      setEditDate("");
      setEditTime("");
      setEditDescription("");
      setEditDepositPaid(false);
      return;
    }
    const start = new Date(selectedAppointment.startsAt);
    setEditDate(format(start, "yyyy-MM-dd"));
    setEditTime(format(start, "HH:mm"));
    setEditDescription(selectedAppointment.description || "");
    setEditDepositPaid(selectedAppointment.depositStatus === "paid");
  }, [selectedAppointmentId]);

  const toggleDepositPaid = async (appt: Appointment) => {
    const isPaid = appt.depositStatus === "paid";
    const shouldBePaid = !isPaid;
    const requiresDeposit = Boolean(appt.depositRequired || (appt.depositAmount || 0) > 0);
    const nextStatus = shouldBePaid ? "paid" : requiresDeposit ? "pending" : "none";
    await fetch(`/api/appointments/${appt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        depositStatus: nextStatus,
        depositPaidAt: shouldBePaid ? new Date().toISOString() : null
      })
    });
    await load();
  };

  const selectAppointment = (appt: Appointment) => {
    setSelectedAppointmentId(appt.id);
  };

  const updateAppointment = async () => {
    if (!selectedAppointment || !editDate || !editTime) return;
    const previousStart = new Date(selectedAppointment.startsAt);
    const previousEnd = new Date(selectedAppointment.endsAt);
    const durationMs = previousEnd.getTime() - previousStart.getTime();
    const nextStart = new Date(`${editDate}T${editTime}:00`);
    const nextEnd = new Date(nextStart.getTime() + Math.max(durationMs, 30 * 60 * 1000));

    await fetch(`/api/appointments/${selectedAppointment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startsAt: nextStart.toISOString(),
        endsAt: nextEnd.toISOString(),
        description: editDescription || null,
        depositStatus: editDepositPaid ? "paid" : "pending",
        depositPaidAt: editDepositPaid ? new Date().toISOString() : null
      })
    });
    await load();
  };

  const deleteAppointment = async () => {
    if (!selectedAppointment) return;
    await fetch(`/api/appointments/${selectedAppointment.id}`, { method: "DELETE" });
    setSelectedAppointmentId(null);
    await load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              className="w-1/2 sm:w-auto"
              variant={view === "week" ? "primary" : "secondary"}
              onClick={() => setView("week")}
            >
              Tydzień
            </Button>
            <Button
              className="w-1/2 sm:w-auto"
              variant={view === "month" ? "primary" : "secondary"}
              onClick={() => setView("month")}
            >
              Miesiąc
            </Button>
          </div>
          {view === "month" ? (
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>Poprzedni</Button>
              <div className="text-sm font-semibold">{format(currentMonth, "MMMM yyyy", { locale: pl })}</div>
              <Button variant="secondary" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>Następny</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  const next = addDays(selectedDate, -7);
                  setSelectedDate(next);
                  setCurrentMonth(next);
                }}
              >
                Poprzedni tydzień
              </Button>
              <div className="text-sm font-semibold">
                {format(weekStart, "dd MMM", { locale: pl })} - {format(addDays(weekStart, 6), "dd MMM", { locale: pl })}
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  const next = addDays(selectedDate, 7);
                  setSelectedDate(next);
                  setCurrentMonth(next);
                }}
              >
                Następny tydzień
              </Button>
            </div>
          )}
        </div>
        {view === "month" ? (
          <>
            <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-ink-400">
              {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((day) => (
                <div key={day} className="text-center">{day}</div>
              ))}
            </div>
            <div className="mt-2">
              <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const isSelected = isSameDay(day, selectedDate);
                const dayAppointments = appointmentsByDay[key] || [];
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedDate(day)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedDate(day);
                      }
                    }}
                    className={`min-h-[96px] rounded-xl border px-2 py-2 text-left text-xs transition ${
                      isSelected ? "border-accent-500 bg-ink-800/80" : "border-ink-700 bg-ink-900/40"
                    } ${isSameMonth(day, currentMonth) ? "text-ink-100" : "text-ink-500"}`}
                  >
                    <div className="font-semibold">{format(day, "d")}</div>
                    <div className="mt-1 space-y-1">
                      {dayAppointments.slice(0, 2).map((appt) => (
                        <button
                          key={appt.id}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            selectAppointment(appt);
                          }}
                          className={`w-full rounded-md border px-2 py-1 text-left text-[11px] ${
                            selectedAppointmentId === appt.id ? "border-accent-500/70 bg-ink-800/70" : "border-ink-700"
                          }`}
                        >
                          {format(new Date(appt.startsAt), "HH:mm")} · {appt.client.name}
                          <div className="text-[10px] text-ink-400">
                            Zadatek: {appt.depositStatus === "paid" ? "tak" : "nie"}
                          </div>
                        </button>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-[11px] text-ink-400">+{dayAppointments.length - 2} więcej</div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 grid gap-3 md:grid-cols-7">
            {weekDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const isSelected = isSameDay(day, selectedDate);
              const dayAppointments = appointmentsByDay[key] || [];
              return (
                <div
                  key={key}
                  onClick={() => setSelectedDate(day)}
                  className={`rounded-xl border p-3 text-xs transition ${
                    isSelected ? "border-accent-500 bg-ink-800/80" : "border-ink-700 bg-ink-900/40"
                  }`}
                >
                  <div className="text-ink-400">{format(day, "EEE", { locale: pl })}</div>
                  <div className="font-semibold text-ink-100">{format(day, "dd.MM", { locale: pl })}</div>
                  <div className="mt-2 space-y-2">
                    {dayAppointments.length === 0 && <div className="text-ink-500">Brak wizyt</div>}
                    {dayAppointments.map((appt) => (
                      <button
                        key={appt.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          selectAppointment(appt);
                        }}
                        className={`w-full rounded-lg border px-2 py-1 text-left ${
                          selectedAppointmentId === appt.id ? "border-accent-500/70 bg-ink-800/70" : "border-ink-700"
                        }`}
                      >
                        <div className="font-semibold">{format(new Date(appt.startsAt), "HH:mm")}</div>
                        <div className="text-ink-400">{appt.client.name}</div>
                        <div className="text-[10px] text-ink-400">
                          Zadatek: {appt.depositStatus === "paid" ? "tak" : "nie"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            </div>
            <div className="mt-4 space-y-3 md:hidden">
              {weekDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayAppointments = appointmentsByDay[key] || [];
                return (
                  <div key={key} className="rounded-xl border border-ink-700 p-3">
                    <div className="text-xs text-ink-400">{format(day, "EEEE", { locale: pl })}</div>
                    <div className="text-sm font-semibold text-ink-100">{format(day, "dd.MM", { locale: pl })}</div>
                    <div className="mt-2 space-y-2">
                      {dayAppointments.length === 0 && <div className="text-xs text-ink-500">Brak wizyt</div>}
                      {dayAppointments.map((appt) => (
                        <button
                          key={appt.id}
                          type="button"
                          onClick={() => selectAppointment(appt)}
                          className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                            selectedAppointmentId === appt.id ? "border-accent-500/70 bg-ink-800/70" : "border-ink-700"
                          }`}
                        >
                          <div className="font-semibold">{format(new Date(appt.startsAt), "HH:mm")}</div>
                          <div className="text-ink-400">{appt.client.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <Card>
        <div className="text-sm text-ink-400">Nowa wizyta</div>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <div className="text-xs text-ink-400">Data</div>
            <div className="font-semibold">{format(selectedDate, "dd.MM.yyyy", { locale: pl })}</div>
          </div>
          <select
            className="w-full rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-2 text-sm"
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
          >
            <option value="">Wybierz artystę</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>{artist.name}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs text-ink-300">
            <input type="checkbox" checked={newClientMode} onChange={(e) => setNewClientMode(e.target.checked)} />
            Nowy klient (telefon)
          </label>

          {newClientMode ? (
            <div className="grid gap-2">
              <Input placeholder="Imię i nazwisko" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
              <Input placeholder="Telefon" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
              <Input placeholder="Email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
              <Input placeholder="Instagram" value={newClient.igHandle} onChange={(e) => setNewClient({ ...newClient, igHandle: e.target.value })} />
            </div>
          ) : (
            <select
              className="w-full rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-2 text-sm"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Wybierz klienta</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          )}

          <div className="grid grid-cols-1 gap-2">
            <select
              className="w-full rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-2 text-sm"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              {Array.from({ length: 24 }).flatMap((_, idx) => {
                const hour = String(idx).padStart(2, "0");
                const values = [`${hour}:00`, `${hour}:30`];
                return values.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ));
              })}
            </select>
          </div>
          <Input placeholder="Opis" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="rounded-xl border border-ink-700 p-3">
            <div className="text-xs text-ink-400">Zadatek</div>
            <div className="mt-2 grid grid-cols-1 gap-2">
              <Input placeholder="Kwota zadatku" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
            </div>
            <label className="mt-3 flex items-center gap-2 text-xs text-ink-300">
              <input
                type="checkbox"
                checked={depositPaid}
                onChange={(e) => setDepositPaid(e.target.checked)}
                disabled={depositAmountNumber <= 0}
              />
              Wpłacony zadatek
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={createAppointment} disabled={!artistId || (!newClientMode && !clientId) || (newClientMode && !newClient.name)}>
            Dodaj wizytę
          </Button>
        </div>
      </Card>

      <Card>
        <div className="text-sm text-ink-400">Wizyty w wybranym dniu</div>
        <div className="mt-4 space-y-3 text-sm">
          {selectedDayAppointments.length === 0 && (
            <div className="text-xs text-ink-500">Brak wizyt w tym dniu.</div>
          )}
          {selectedDayAppointments.map((appt) => (
            <div key={appt.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-700 p-3">
              <div>
                <div className="font-semibold">{appt.client.name}</div>
                <div className="text-xs text-ink-400">
                  {format(new Date(appt.startsAt), "HH:mm")} · {appt.artist.name}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => selectAppointment(appt)}>
                  Edytuj
                </Button>
                <Button variant="secondary" onClick={() => toggleDepositPaid(appt)}>
                  Zadatek: {appt.depositStatus === "paid" ? "tak" : "nie"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {selectedAppointment && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-ink-400">Edytuj wizytę</div>
              <div className="text-sm font-semibold">{selectedAppointment.client.name}</div>
              <div className="text-xs text-ink-500">{selectedAppointment.artist.name}</div>
            </div>
            <button
              type="button"
              className="text-xs text-ink-400"
              onClick={() => setSelectedAppointmentId(null)}
            >
              Zamknij
            </button>
          </div>
          <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
            <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            <select
              className="w-full rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-2 text-sm"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
            >
              {Array.from({ length: 24 }).flatMap((_, idx) => {
                const hour = String(idx).padStart(2, "0");
                const values = [`${hour}:00`, `${hour}:30`];
                return values.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ));
              })}
            </select>
            <Input
              placeholder="Opis"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            <label className="flex items-center gap-2 text-xs text-ink-300">
              <input
                type="checkbox"
                checked={editDepositPaid}
                onChange={(e) => setEditDepositPaid(e.target.checked)}
              />
              Wpłacony zadatek
            </label>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={updateAppointment}>Zapisz zmiany</Button>
            <Button
              className="bg-red-500/20 text-red-100 hover:bg-red-500/30"
              onClick={deleteAppointment}
            >
              Usuń wizytę
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
