"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type Client = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  igHandle?: string | null;
  marketingOptIn: boolean;
  createdAt: string;
};

const emptyForm = { name: "", email: "", phone: "", igHandle: "", marketingOptIn: false };

type ClientForm = typeof emptyForm;

export function ClientsTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/clients");
    const data = (await res.json()) as Client[];
    setClients(data);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const createClient = async () => {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        igHandle: form.igHandle || undefined,
        marketingOptIn: form.marketingOptIn
      })
    });
    if (res.ok) {
      setForm(emptyForm);
      await load();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input placeholder="Imię i nazwisko" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input placeholder="Instagram" value={form.igHandle} onChange={(e) => setForm({ ...form, igHandle: e.target.value })} />
          <label className="flex items-center gap-2 text-xs text-ink-300">
            <input
              type="checkbox"
              checked={form.marketingOptIn}
              onChange={(e) => setForm({ ...form, marketingOptIn: e.target.checked })}
            />
            Zgoda marketingowa
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={createClient} disabled={!form.name}>Dodaj klienta</Button>
        </div>
      </Card>

      <Card>
        <div className="text-sm text-ink-400">Lista klientów</div>
        <div className="mt-4 grid gap-3">
          {loading && <div className="text-xs text-ink-400">Ładowanie...</div>}
          {!loading && clients.length === 0 && <div className="text-xs text-ink-500">Brak klientów</div>}
          {clients.map((client) => (
            <div key={client.id} className="flex flex-col gap-2 rounded-xl border border-ink-700 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold">
                  <Link href={`/app/clients/${client.id}`} className="hover:text-accent-400">
                    {client.name}
                  </Link>
                </div>
                <div className="text-xs text-ink-400">
                  {client.email || "Brak email"} · {client.phone || "Brak telefonu"}
                </div>
                <div className="text-xs text-ink-500">{client.marketingOptIn ? "Zgoda marketingowa" : "Brak zgody marketingowej"}</div>
              </div>
              <div className="flex gap-2">
                <Link href={`/app/clients/${client.id}`}>
                  <Button variant="secondary">Szczegóły</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
