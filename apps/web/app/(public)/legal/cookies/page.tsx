export default function CookiesPage() {
  return (
    <main className="pb-24">
      <section className="mx-auto max-w-3xl py-16">
        <h1 className="text-4xl font-display">Polityka cookies</h1>
        <p className="mt-4 text-ink-200">Polityka cookies TaFlo CRM</p>
        <p className="mt-2 text-ink-200">Obowiązuje od: 17.02.2026</p>
        <div className="mt-8 space-y-6 text-sm text-ink-200">
          <div>
            <p className="font-semibold">1. Czym są cookies</p>
            <p>Cookies to niewielkie pliki zapisywane na urządzeniu użytkownika, które wspierają działanie serwisu.</p>
          </div>
          <div>
            <p className="font-semibold">2. Jakich cookies używamy</p>
            <p>Na ten moment TaFlo CRM używa wyłącznie cookies technicznych/niezbędnych (np. sesja logowania).</p>
            <p>W przyszłości mogą zostać dodane cookies analityczne – wtedy polityka zostanie zaktualizowana.</p>
          </div>
          <div>
            <p className="font-semibold">3. Zarządzanie cookies</p>
            <p>Użytkownik może w każdej chwili zmienić ustawienia cookies w swojej przeglądarce.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
