"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Org = { id: string; name: string };

export function LeadLinks() {
  const [org, setOrg] = useState<Org | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/org")
      .then((res) => res.json())
      .then((data) => setOrg(data))
      .catch(() => setOrg(null));
  }, []);

  if (!org) {
    return null;
  }

  const leadLink = `${origin}/lead/${org.id}`;
  const widgetSnippet = `<div id=\"inkflow-lead\"></div>\n<script src=\"${origin}/widget.js\" data-org=\"${org.id}\"></script>`;

  return (
    <Card>
      <div className="text-sm text-ink-400">Formularz leadów</div>
      <div className="mt-3 space-y-4">
        <div>
          <div className="text-xs text-ink-500">Link do formularza</div>
          <div className="mt-2 flex gap-2">
            <Input value={leadLink} readOnly />
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(leadLink)}>
              Kopiuj
            </Button>
          </div>
        </div>
        <div>
          <div className="text-xs text-ink-500">Widget na stronę</div>
          <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-ink-700 bg-ink-900/70 p-3 text-xs text-ink-200">
            {widgetSnippet}
          </pre>
        </div>
      </div>
    </Card>
  );
}
