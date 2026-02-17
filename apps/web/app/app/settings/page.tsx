"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MetaConnectCard } from "@/components/app/meta-connect-card";
import { LeadLinks } from "@/components/app/lead-links";
import { signOut } from "next-auth/react";

type Artist = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

type SeatInfo = {
  base: number;
  extra: number;
  total: number;
  used: number;
  price: number;
  canAdd: boolean;
  plan: string;
};

export default function SettingsPage() {
  const [studioName, setStudioName] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [seatInfo, setSeatInfo] = useState<SeatInfo | null>(null);
  const [newArtist, setNewArtist] = useState({ name: "", email: "", phone: "" });
  const [addingArtist, setAddingArtist] = useState(false);
  const [artistStatus, setArtistStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [templates, setTemplates] = useState({
    templateReminder: "",
    templateDeposit: "",
    templateFollowUp: ""
  });
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [templateStatus, setTemplateStatus] = useState<string | null>(null);
  const [depositSettings, setDepositSettings] = useState({
    depositType: "fixed",
    depositValue: 0,
    depositDueDays: 7
  });
  const [savingDeposit, setSavingDeposit] = useState(false);
  const [depositStatus, setDepositStatus] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [orgRes, artistsRes, seatsRes] = await Promise.all([
        fetch("/api/org"),
        fetch("/api/artists"),
        fetch("/api/billing/seats")
      ]);
      if (orgRes.ok) {
        const org = await orgRes.json();
        setStudioName(org?.name || "");
      }
      if (artistsRes.ok) {
        const artistsData = await artistsRes.json();
        setArtists(artistsData || []);
        setSmsPhone(artistsData?.[0]?.phone || "");
      }
      if (seatsRes.ok) {
        const seats = await seatsRes.json();
        setSeatInfo(seats);
      }

      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setTemplates({
          templateReminder: data?.templateReminder || "",
          templateDeposit: data?.templateDeposit || "",
          templateFollowUp: data?.templateFollowUp || ""
        });
        setDepositSettings({
          depositType: data?.depositType || "fixed",
          depositValue: data?.depositValue ?? 0,
          depositDueDays: data?.depositDueDays ?? 7
        });
      }
    };
    load().catch(() => undefined);
  }, []);

  const save = async () => {
    setSaving(true);
    setStatus(null);
    const res = await fetch("/api/org", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: studioName, artistPhone: smsPhone })
    });
    if (res.ok) {
      setStatus("Zapisano.");
    } else {
      setStatus("Nie udało się zapisać.");
    }
    setSaving(false);
  };

  const addArtist = async () => {
    if (!newArtist.name.trim()) return;
    setAddingArtist(true);
    setArtistStatus(null);
    const res = await fetch("/api/artists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newArtist)
    });
    if (res.ok) {
      setNewArtist({ name: "", email: "", phone: "" });
      setArtistStatus("Dodano osobę.");
      const artistsRes = await fetch("/api/artists");
      if (artistsRes.ok) {
        const artistsData = await artistsRes.json();
        setArtists(artistsData || []);
      }
      const seatsRes = await fetch("/api/billing/seats");
      if (seatsRes.ok) {
        setSeatInfo(await seatsRes.json());
      }
    } else {
      const data = await res.json().catch(() => ({}));
      setArtistStatus(data?.error || "Nie udało się dodać osoby.");
    }
    setAddingArtist(false);
  };

  const buySeat = async () => {
    const res = await fetch("/api/billing/seats", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (data?.url) {
      window.location.href = data.url as string;
    }
  };

  const saveTemplates = async () => {
    setSavingTemplates(true);
    setTemplateStatus(null);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templates)
    });
    if (res.ok) {
      setTemplateStatus("Zapisano szablony.");
    } else {
      setTemplateStatus("Nie udało się zapisać.");
    }
    setSavingTemplates(false);
  };

  const saveDepositSettings = async () => {
    setSavingDeposit(true);
    setDepositStatus(null);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(depositSettings)
    });
    if (res.ok) {
      setDepositStatus("Zapisano ustawienia zadatku.");
    } else {
      setDepositStatus("Nie udało się zapisać ustawień.");
    }
    setSavingDeposit(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display md:text-3xl">Ustawienia</h1>
        <p className="text-sm text-ink-300">Studio, szablony, role, RODO.</p>
      </div>
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm">Nazwa studia</label>
            <Input placeholder="TaFlo Tattoo" value={studioName} onChange={(e) => setStudioName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Telefon do SMS</label>
            <Input placeholder="+48" value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)} />
          </div>
        </div>
        {status && <div className="mt-3 text-xs text-ink-400">{status}</div>}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={save} disabled={saving || !studioName.trim()}>
            {saving ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="text-sm text-ink-400">Zespół</div>
        <div className="mt-3 space-y-2 text-sm">
          {artists.length === 0 && <div className="text-xs text-ink-500">Brak osób w zespole.</div>}
          {artists.map((artist) => (
            <div key={artist.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-700 px-3 py-2">
              <div>
                <div className="font-semibold">{artist.name}</div>
                <div className="text-xs text-ink-400">
                  {artist.email || "brak emaila"} · {artist.phone || "brak telefonu"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {seatInfo && (
          <div className="mt-4 text-xs text-ink-400">
            Limit osób: {seatInfo.used}/{seatInfo.total} (plan {seatInfo.plan}, dodatkowe stanowiska: {seatInfo.extra})
          </div>
        )}

        {seatInfo?.canAdd ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input placeholder="Imię i nazwisko" value={newArtist.name} onChange={(e) => setNewArtist({ ...newArtist, name: e.target.value })} />
            <Input placeholder="Email" value={newArtist.email} onChange={(e) => setNewArtist({ ...newArtist, email: e.target.value })} />
            <Input placeholder="Telefon" value={newArtist.phone} onChange={(e) => setNewArtist({ ...newArtist, phone: e.target.value })} />
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-ink-700 bg-ink-900/60 p-3 text-xs text-ink-300">
            Osiągnięto limit osób w planie. Dokup dodatkowe stanowisko za {seatInfo?.price || 30} zł / mies.
          </div>
        )}

        {artistStatus && <div className="mt-2 text-xs text-ink-400">{artistStatus}</div>}
        <div className="mt-4 flex flex-wrap gap-2">
          {seatInfo?.canAdd ? (
            <Button onClick={addArtist} disabled={addingArtist || !newArtist.name.trim()}>
              {addingArtist ? "Dodawanie..." : "Dodaj osobę"}
            </Button>
          ) : (
            <Button onClick={buySeat}>Dokup stanowisko</Button>
          )}
        </div>
      </Card>

      <Card>
        <div className="text-sm text-ink-400">Zadatek</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs text-ink-400">Typ zadatku</label>
            <select
              className="mt-1 w-full rounded-xl border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100"
              value={depositSettings.depositType}
              onChange={(e) =>
                setDepositSettings((prev) => ({ ...prev, depositType: e.target.value }))
              }
            >
              <option value="fixed">Stała kwota (PLN)</option>
              <option value="percent">Procent ceny (%)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-ink-400">
              {depositSettings.depositType === "percent" ? "Wartość (%)" : "Kwota (PLN)"}
            </label>
            <Input
              type="number"
              min={0}
              value={depositSettings.depositValue}
              onChange={(e) =>
                setDepositSettings((prev) => ({
                  ...prev,
                  depositValue: Number(e.target.value || 0)
                }))
              }
            />
          </div>
          <div>
            <label className="text-xs text-ink-400">Termin wpłaty (dni)</label>
            <Input
              type="number"
              min={0}
              value={depositSettings.depositDueDays}
              onChange={(e) =>
                setDepositSettings((prev) => ({
                  ...prev,
                  depositDueDays: Number(e.target.value || 0)
                }))
              }
            />
          </div>
        </div>
        {depositStatus && <div className="mt-2 text-xs text-ink-400">{depositStatus}</div>}
        <div className="mt-4 flex justify-end">
          <Button onClick={saveDepositSettings} disabled={savingDeposit}>
            {savingDeposit ? "Zapisywanie..." : "Zapisz ustawienia"}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="text-sm text-ink-400">RODO</div>
        <div className="mt-3 space-y-2 text-xs text-ink-300">
          <div>Przetwarzamy dane tylko do obsługi zapytania i umówienia wizyty.</div>
          <div>Marketing wysyłamy wyłącznie po wyrażeniu zgody przez klienta.</div>
          <div>Klient może zażądać usunięcia danych w dowolnym momencie.</div>
        </div>
        <div className="mt-3 text-xs">
          <a className="text-accent-400" href="/legal/privacy">Zobacz politykę prywatności</a>
        </div>
      </Card>

      <Card>
        <div className="text-sm text-ink-400">Szablony wiadomości</div>
        <div className="mt-3 grid gap-3">
          <div>
            <label className="text-xs text-ink-400">Przypomnienie o wizycie</label>
            <Textarea
              rows={3}
              value={templates.templateReminder}
              onChange={(e) => setTemplates({ ...templates, templateReminder: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-ink-400">Zadatek</label>
            <Textarea
              rows={3}
              value={templates.templateDeposit}
              onChange={(e) => setTemplates({ ...templates, templateDeposit: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-ink-400">Follow-up</label>
            <Textarea
              rows={3}
              value={templates.templateFollowUp}
              onChange={(e) => setTemplates({ ...templates, templateFollowUp: e.target.value })}
            />
          </div>
          <div className="text-[11px] text-ink-500">
            Dostępne zmienne: {"{{clientName}}"}, {"{{appointmentDate}}"}, {"{{depositLink}}"}
          </div>
          {templateStatus && <div className="text-xs text-ink-400">{templateStatus}</div>}
          <div className="flex justify-end">
            <Button onClick={saveTemplates} disabled={savingTemplates}>
              {savingTemplates ? "Zapisywanie..." : "Zapisz szablony"}
            </Button>
          </div>
        </div>
      </Card>

      <LeadLinks />

      <MetaConnectCard />

      <Card>
        <div className="text-sm text-ink-400">Konto</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/auth/login" })}>
            Wyloguj się
          </Button>
        </div>
      </Card>
    </div>
  );
}
