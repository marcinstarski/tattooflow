import Link from "next/link";
import { prisma } from "@/server/db";
import { LeadPublicForm } from "@/components/public/lead-public-form";

export default async function LeadPublicPage({ params }: { params: { orgId: string } }) {
  const org = await prisma.organization.findUnique({ where: { id: params.orgId } });

  if (!org) {
    return (
      <main className="min-h-screen bg-ink-900 px-6 pb-24">
        <section className="mx-auto max-w-2xl py-16 text-ink-200">
          <h1 className="text-3xl font-display">Nie znaleziono studia</h1>
          <p className="mt-3 text-sm text-ink-400">
            Sprawdź, czy link jest poprawny albo skontaktuj się bezpośrednio ze studiem.
          </p>
          <div className="mt-6">
            <Link className="text-accent-400" href="/">Wróć na stronę główną</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink-900 px-6 pb-24">
      <section className="mx-auto max-w-2xl py-16">
        <div className="rounded-3xl border border-ink-700 bg-ink-900/70 p-8">
          <div className="text-xs uppercase tracking-[0.2em] text-ink-500">InkFlow</div>
          <h1 className="mt-3 text-3xl font-display">Formularz zgłoszeniowy</h1>
          <p className="mt-2 text-sm text-ink-300">
            {org.name} · Odpowiemy możliwie szybko.
          </p>
          <div className="mt-6">
            <LeadPublicForm orgId={params.orgId} />
          </div>
        </div>
        <div className="mt-6 text-xs text-ink-500">
          Masz pytania? Sprawdź <Link className="text-accent-400" href="/legal/privacy">politykę prywatności</Link>.
        </div>
      </section>
    </main>
  );
}
