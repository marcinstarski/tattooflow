import { BillingPanel } from "@/components/app/billing-panel";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Rozliczenia</h1>
        <p className="text-sm text-ink-300">Historia faktur i płatności.</p>
      </div>
      <BillingPanel />
    </div>
  );
}
