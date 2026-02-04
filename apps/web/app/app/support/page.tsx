import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function AppSupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Pomoc</h1>
        <p className="text-sm text-ink-300">Wsparcie i zgłaszanie błędów.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <form className="space-y-4">
            <Input placeholder="Temat" />
            <Textarea rows={5} placeholder="Opis problemu" />
            <Button>Wyślij</Button>
          </form>
        </Card>
        <Card>
          <div className="text-sm font-semibold">FAQ</div>
          <ul className="mt-4 space-y-2 text-sm text-ink-200">
            <li>• Jeśli SMS nie działa, sprawdź klucze Twilio.</li>
            <li>• Stripe webhooks wymagają poprawnego SECRET.</li>
            <li>• Możesz zintegrować PostHog opcjonalnie.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
