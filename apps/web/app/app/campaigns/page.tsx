import { CampaignsBoard } from "@/components/app/campaigns-board";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Kampanie</h1>
        <p className="text-sm text-ink-300">Wysyłki marketingowe z opt-in.</p>
      </div>
      <CampaignsBoard />
    </div>
  );
}
