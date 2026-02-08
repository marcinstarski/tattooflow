import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  return (
    <main className="pb-24">
      <section className="py-16">
        <h1 className="text-3xl font-display sm:text-4xl">Pomoc</h1>
        <p className="mt-4 text-sm text-ink-200 sm:text-base">Masz pytanie? Napisz do nas.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <form className="space-y-4">
              <div>
                <label className="text-sm">Email</label>
                <Input type="email" placeholder="hello@studio.pl" />
              </div>
              <div>
                <label className="text-sm">Temat</label>
                <Input placeholder="Problem z zadatkiem" />
              </div>
              <div>
                <label className="text-sm">Wiadomość</label>
                <Textarea rows={5} placeholder="Opisz problem" />
              </div>
              <Button type="submit">Wyślij</Button>
            </form>
          </Card>
          <Card>
            <div className="text-sm font-semibold">FAQ</div>
            <ul className="mt-4 space-y-2 text-sm text-ink-200">
              <li>• Statusy płatności odświeżają się po webhooku Stripe.</li>
              <li>• SMS wymagają aktywnego konta Twilio lub SMSAPI.</li>
              <li>• Możesz usuwać dane klientów zgodnie z RODO w ustawieniach.</li>
            </ul>
          </Card>
        </div>
      </section>
    </main>
  );
}
