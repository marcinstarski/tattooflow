import { LeadsBoard } from "@/components/app/leads-board";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display md:text-3xl">Leady</h1>
        <p className="text-sm text-ink-300">Pipeline leadów z deduplikacją.</p>
      </div>
      <LeadsBoard />
    </div>
  );
}
