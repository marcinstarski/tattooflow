"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MetaConnectCard } from "@/components/app/meta-connect-card";

type Artist = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export default function ProfilePage() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/profile");
    if (!res.ok) {
      setArtist(null);
      return;
    }
    const data = (await res.json()) as Artist;
    setArtist(data);
    setForm({
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || ""
    });
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const save = async () => {
    setSaving(true);
    setStatus(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined
      })
    });
    setSaving(false);
    if (res.ok) {
      setStatus("Zapisano.");
      await load();
      return;
    }
    setStatus("Nie udało się zapisać.");
  };

  if (!artist) {
    return (
      <div className="space-y-3">
        <h1 className="text-3xl font-display">Mój profil</h1>
        <div className="text-sm text-ink-400">Brak profilu artysty.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Mój profil</h1>
        <p className="text-sm text-ink-300">Twoje dane i integracje.</p>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm">Imię i nazwisko</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm">Email</label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-sm">Telefon</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        {status && <div className="mt-3 text-xs text-ink-400">{status}</div>}
        <div className="mt-4">
          <Button onClick={save} disabled={saving || !form.name.trim()}>
            {saving ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </div>
      </Card>

      <MetaConnectCard />
    </div>
  );
}
