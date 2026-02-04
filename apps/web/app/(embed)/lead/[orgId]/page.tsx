import { prisma } from "@/server/db";
import { LeadPublicForm } from "@/components/public/lead-public-form";

export default async function LeadPublicPage({ params }: { params: { orgId: string } }) {
  const org = await prisma.organization.findUnique({ where: { id: params.orgId } });

  if (!org) {
    return (
      <main className="min-h-screen bg-transparent px-6 py-10">
        <section className="mx-auto max-w-xl text-ink-200">
          <h1 className="text-2xl font-display">Nie znaleziono studia</h1>
          <p className="mt-3 text-sm text-ink-400">
            Sprawdź, czy link jest poprawny albo skontaktuj się bezpośrednio ze studiem.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-10">
      <section className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-ink-700 bg-ink-900/70 p-8">
          <LeadPublicForm orgId={params.orgId} />
        </div>
      </section>
    </main>
  );
}
