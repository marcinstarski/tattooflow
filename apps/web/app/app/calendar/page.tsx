import { CalendarFull } from "@/components/app/calendar-full";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display md:text-3xl">Kalendarz</h1>
        <p className="text-sm text-ink-300">Kliknij dzień, aby dodać wizytę.</p>
      </div>
      <CalendarFull />
    </div>
  );
}
