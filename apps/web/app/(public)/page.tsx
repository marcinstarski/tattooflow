import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { faqs } from "@/content/faq";

const heroImage =
  "https://images.unsplash.com/photo-1753259669126-660f46975072?auto=format&fit=crop&w=1600&q=80";

const proofItems = [
  {
    title: "Więcej wizyt z DM",
    desc: "Przypomnienia i szybkie odpowiedzi zamieniają zapytania w rezerwacje.",
    image:
      "https://images.unsplash.com/photo-1639430355308-1d7b0e5eb5f0?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Mniej chaosu w kalendarzu",
    desc: "Cały zespół widzi dostępność i statusy wizyt w jednym miejscu.",
    image:
      "https://images.unsplash.com/photo-1753259789341-808371092e19?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Profesjonalny wizerunek",
    desc: "Spójna komunikacja i zadatki budują zaufanie do studia.",
    image:
      "https://images.pexels.com/photos/35426255/pexels-photo-35426255.jpeg?auto=compress&cs=tinysrgb&w=1200"
  }
];

export default function LandingPage() {
  return (
    <main>
      <section className="grid gap-10 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-6">
          <Badge className="border-accent-500 text-accent-400">CRM dla tatuatorów</Badge>
          <h1 className="text-3xl font-display leading-tight sm:text-4xl md:text-6xl">
            TaFlo pomaga domykać więcej klientów na tatuaż.
          </h1>
          <p className="text-base text-ink-200 sm:text-lg">
            Leady, kalendarz, zadatki, automatyzacje i marketing w jednym miejscu. Zbudowane z myślą o studiach tatuażu.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth/register">
              <Button>Rozpocznij 14‑dniowy okres próbny</Button>
            </Link>
            <Link href="/demo">
              <Button variant="secondary">Zobacz demo</Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-ink-400">
            <span>Bez karty • 1 klik do uruchomienia</span>
            <span>PLN • Europe/Warsaw</span>
          </div>
        </div>
        <Card className="overflow-hidden p-0">
          <div className="relative h-48 sm:h-56">
            <img
              src={heroImage}
              alt="Tatuażysta podczas pracy w studio"
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
          </div>
          <div className="space-y-2 p-6">
            <div className="text-sm font-semibold">Podgląd studia</div>
            <p className="text-xs text-ink-300">
              Leady, kalendarz i zadatki w jednym miejscu.
            </p>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          "Zamień DM w rezerwacje dzięki automatycznym follow-upom.",
          "Nie gub leadów z Instagrama, Facebooka i strony.",
          "Zbieraj zadatki i śledź płatności bez chaosu."
        ].map((item) => (
          <Card key={item} className="text-sm text-ink-200">
            {item}
          </Card>
        ))}
      </section>

      <section className="mt-20 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-display">Co dostajesz?</h2>
          <p className="mt-4 text-ink-200">
            Kompletny CRM z automatyzacjami, który skraca czas obsługi klienta i zwiększa konwersję.
          </p>
        </div>
        <div className="grid gap-4">
          {["Leady i karta klienta", "Kalendarz i przypomnienia", "Zadatki + płatności", "Marketing z opt-in"].map(
            (feature) => (
              <Card key={feature} className="flex items-center justify-between">
                <span>{feature}</span>
              </Card>
            )
          )}
        </div>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        {proofItems.map((item) => (
          <Card key={item.title} className="overflow-hidden p-0">
            <div className="relative h-44">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-xs text-ink-200">{item.desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="mt-20">
        <Card className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-display">Darmowa checklista</h3>
            <p className="text-sm text-ink-200">Pobierz checklistę: Jak domykać klientów na tatuaż.</p>
          </div>
          <form className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              className="w-full flex-1 rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-2 text-sm"
              placeholder="Twój email"
              type="email"
            />
            <Button type="submit">Pobierz</Button>
          </form>
        </Card>
      </section>

      <section className="mt-20">
        <h2 className="text-3xl font-display">FAQ</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {faqs.map((faq) => (
            <Card key={faq.q}>
              <div className="font-semibold">{faq.q}</div>
              <p className="mt-2 text-sm text-ink-200">{faq.a}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
