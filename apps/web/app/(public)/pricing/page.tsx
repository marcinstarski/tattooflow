import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "279 zł",
    desc: "Dla jednego artysty",
    features: ["1 artysta", "Leady + kalendarz", "Przypomnienia SMS/email", "1 kampania/mies"],
    tier: "starter"
  },
  {
    name: "Pro",
    price: "419 zł",
    desc: "Najpopularniejszy",
    features: ["3 artystów", "Automatyzacje", "Zadatki + Stripe", "5 kampanii/mies"],
    tier: "pro"
  },
  {
    name: "Studio",
    price: "539 zł",
    desc: "Dla studiów",
    features: ["10 artystów", "Role i recepcja", "Zaawansowane raporty", "Nielimitowane kampanie"],
    tier: "studio"
  }
];

export default function PricingPage() {
  return (
    <main className="pb-24">
      <section className="py-16">
        <h1 className="text-4xl font-display">Cennik</h1>
        <p className="mt-4 text-ink-200">14 dni okresu próbnego. Bez karty. PLN netto.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className="flex flex-col gap-4">
              <div>
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="text-sm text-ink-400">{plan.desc}</p>
              </div>
              <div className="text-3xl font-display">{plan.price}</div>
              <ul className="text-sm text-ink-200">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <Link href={`/auth/register?tier=${plan.tier}`} className="mt-auto">
                <Button className="w-full">Wybierz plan</Button>
              </Link>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-sm text-ink-300">
          Dodatkowy artysta: +30 zł / miesiąc.
        </div>
      </section>
    </main>
  );
}
