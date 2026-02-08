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
  const iframeSnippet = `<iframe src=\"${origin}/lead/${org.id}\" style=\"width:100%;max-width:100%;height:620px;border:0;border-radius:20px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,0.12);background:transparent;display:block;box-sizing:border-box;\" loading=\"lazy\" title=\"Formularz kontaktowy\"></iframe>`;

  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="text-sm text-ink-400">Formularz leadów</div>
      <div className="mt-3 space-y-4">
        <div>
          <div className="text-xs text-ink-500">Link do formularza</div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input value={leadLink} readOnly className="min-w-0" />
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(leadLink)}>
              Kopiuj
            </Button>
          </div>
        </div>
        <div>
          <div className="text-xs text-ink-500">Kod do wklejenia na stronę</div>
          <pre className="mt-2 max-w-full overflow-x-auto whitespace-pre-wrap break-all rounded-xl border border-ink-700 bg-ink-900/70 p-3 text-xs text-ink-200">
            {iframeSnippet}
          </pre>
          <div className="mt-2">
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(iframeSnippet)}>
              Kopiuj kod iframe
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
