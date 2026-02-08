"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const channels = ["email", "sms"] as const;

type Channel = (typeof channels)[number];

type Campaign = {
  id: string;
  name: string;
  channel: Channel;
  subject?: string | null;
  body: string;
  status: string;
  sendAt?: string | null;
  createdAt: string;
};

type FormState = {
  name: string;
  channel: Channel;
  subject: string;
  body: string;
  sendAt: string;
  onlyOptIn: boolean;
};

const emptyForm: FormState = {
  name: "",
  channel: "email",
  subject: "",
  body: "",
  sendAt: "",
  onlyOptIn: true
};

export function CampaignsBoard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/campaigns");
    const data = (await res.json()) as Campaign[];
    setCampaigns(data);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const createCampaign = async () => {
    const payload = {
      name: form.name,
      channel: form.channel,
      subject: form.subject || undefined,
      body: form.body,
      sendAt: form.sendAt ? new Date(form.sendAt).toISOString() : undefined,
      onlyOptIn: form.onlyOptIn
    };

    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
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
          <Input placeholder="Nazwa kampanii" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select
            className="w-full rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-2 text-sm"
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value as Channel })}
          >
            {channels.map((channel) => (
              <option key={channel} value={channel}>{channel}</option>
            ))}
          </select>
          <Input placeholder="Temat (email)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <Input type="datetime-local" value={form.sendAt} onChange={(e) => setForm({ ...form, sendAt: e.target.value })} />
          <label className="flex items-center gap-2 text-xs text-ink-300">
            <input
              type="checkbox"
              checked={form.onlyOptIn}
              onChange={(e) => setForm({ ...form, onlyOptIn: e.target.checked })}
            />
            Tylko opt-in
          </label>
        </div>
        <div className="mt-4">
          <Textarea rows={3} placeholder="Treść kampanii" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={createCampaign} disabled={!form.name || !form.body}>Zapisz kampanię</Button>
        </div>
      </Card>

      <Card>
        <div className="text-sm text-ink-400">Kampanie</div>
        <div className="mt-4 space-y-3">
          {loading && <div className="text-xs text-ink-400">Ładowanie...</div>}
          {!loading && campaigns.length === 0 && <div className="text-xs text-ink-500">Brak kampanii</div>}
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-xl border border-ink-700 p-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{campaign.name}</div>
                <div className="text-xs text-ink-400">{campaign.status}</div>
              </div>
              <div className="text-xs text-ink-500">{campaign.channel} · {campaign.sendAt ? new Date(campaign.sendAt).toLocaleString("pl-PL") : "draft"}</div>
              <div className="mt-2 text-sm text-ink-100">{campaign.body}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
