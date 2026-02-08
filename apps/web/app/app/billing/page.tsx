import { BillingPanel } from "@/components/app/billing-panel";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display md:text-3xl">Rozliczenia</h1>
        <p className="text-sm text-ink-300">Historia faktur i płatności.</p>
      </div>
      <BillingPanel />
    </div>
  );
}
