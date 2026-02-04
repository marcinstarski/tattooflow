import { ClientsTable } from "@/components/app/clients-table";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Klienci</h1>
        <p className="text-sm text-ink-300">Historia wizyt i notatki.</p>
      </div>
      <ClientsTable />
    </div>
  );
}
