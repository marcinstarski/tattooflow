"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const plans = ["starter", "pro", "studio"] as const;

type Org = {
  id: string;
  plan: string;
  subscriptionStatus?: string | null;
  trialEndsAt?: string | null;
};

type Invoice = {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl?: string | null;
  issuedAt: string;
};

type BillingProfile = {
  companyName: string;
  taxId?: string | null;
  address: string;
};

export function BillingPanel() {
  const [org, setOrg] = useState<Org | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [profile, setProfile] = useState<BillingProfile>({ companyName: "", taxId: "", address: "" });

  const load = async () => {
    const [orgRes, invoicesRes, profileRes] = await Promise.all([
      fetch("/api/org"),
      fetch("/api/invoices"),
      fetch("/api/billing/profile")
    ]);
    setOrg((await orgRes.json()) as Org);
    setInvoices((await invoicesRes.json()) as Invoice[]);
    const profileData = await profileRes.json();
    if (profileData) {
      setProfile(profileData as BillingProfile);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const openCheckout = async (plan: string) => {
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  const openPortal = async () => {
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  const saveProfile = async () => {
    await fetch("/api/billing/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="text-sm text-ink-400">Status</div>
        <div className="mt-2 text-lg font-semibold">
          {org?.subscriptionStatus || "trialing"} · plan: {org?.plan || "starter"}
        </div>
        {org?.trialEndsAt && (
          <div className="text-xs text-ink-400">Trial do: {new Date(org.trialEndsAt).toLocaleDateString("pl-PL")}</div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {plans.map((plan) => (
            <Button key={plan} onClick={() => openCheckout(plan)}>Wybierz {plan}</Button>
          ))}
          <Button variant="secondary" onClick={openPortal}>Portal płatności</Button>
        </div>
      </Card>

      <Card>
        <div className="text-sm text-ink-400">Dane do faktury</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input placeholder="Nazwa firmy" value={profile.companyName} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} />
          <Input placeholder="NIP" value={profile.taxId || ""} onChange={(e) => setProfile({ ...profile, taxId: e.target.value })} />
          <Input placeholder="Adres" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={saveProfile}>Zapisz</Button>
        </div>
      </Card>

      <Card>
        <div className="text-sm text-ink-400">Faktury</div>
        <div className="mt-4 space-y-3 text-sm">
          {invoices.length === 0 && <div className="text-xs text-ink-500">Brak faktur</div>}
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex flex-col gap-2 rounded-lg border border-ink-700 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-semibold">{invoice.number}</div>
                <div className="text-xs text-ink-400">{invoice.amount} {invoice.currency} · {invoice.status}</div>
              </div>
              {invoice.pdfUrl ? (
                <a className="text-xs text-accent-400" href={invoice.pdfUrl} target="_blank" rel="noreferrer">PDF</a>
              ) : (
                <span className="text-xs text-ink-500">Brak PDF</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
