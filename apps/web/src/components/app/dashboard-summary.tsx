"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export function DashboardSummary() {
  const [leadsCount, setLeadsCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [leadsRes, appointmentsRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/appointments")
      ]);
      const leads = (await leadsRes.json()) as Array<{ id: string }>;
      const appointments = (await appointmentsRes.json()) as Array<{ id: string }>;
      setLeadsCount(leads.length);
      setAppointmentsCount(appointments.length);
    };
    load().catch(() => undefined);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <div className="text-sm text-ink-400">Leady</div>
        <div className="mt-4 text-3xl font-display">{leadsCount}</div>
      </Card>
      <Card>
        <div className="text-sm text-ink-400">Wizyty</div>
        <div className="mt-4 text-3xl font-display">{appointmentsCount}</div>
      </Card>
    </div>
  );
}
