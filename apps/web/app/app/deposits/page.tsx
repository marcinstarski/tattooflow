import { DepositsBoard } from "@/components/app/deposits-board";

export default function DepositsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Zadatki</h1>
        <p className="text-sm text-ink-300">Lista zadatków i szybkie wysyłki linków.</p>
      </div>
      <DepositsBoard />
    </div>
  );
}
