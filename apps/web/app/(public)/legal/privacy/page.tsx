export default function PrivacyPage() {
  return (
    <main className="pb-24">
      <section className="mx-auto max-w-3xl py-16">
        <h1 className="text-4xl font-display">Polityka prywatności</h1>
        <p className="mt-4 text-ink-200">
          Poniżej znajduje się szablon do uzupełnienia. Wstaw dane administratora, kontakt i szczegóły
          w zależności od Twojego studia.
        </p>
        <div className="mt-8 space-y-6 text-sm text-ink-200">
          <div>
            <p className="font-semibold">1. Administrator danych</p>
            <p>Administrator: [Twoja firma / imię i nazwisko], [adres], [email], [telefon].</p>
          </div>
          <div>
            <p className="font-semibold">2. Zakres danych</p>
            <p>Imię i nazwisko, dane kontaktowe, treść wiadomości, informacje o wizycie i preferencjach.</p>
          </div>
          <div>
            <p className="font-semibold">3. Źródła danych</p>
            <p>Dane podane przez klienta w formularzu, podczas rozmowy lub w wiadomościach z Instagrama i Facebooka.</p>
          </div>
          <div>
            <p className="font-semibold">4. Cele i podstawy prawne</p>
            <p>Obsługa zapytań i rezerwacji wizyt – uzasadniony interes lub wykonanie umowy.</p>
            <p>Marketing – wyłącznie po wyrażeniu zgody przez klienta.</p>
          </div>
          <div>
            <p className="font-semibold">5. Okres przechowywania</p>
            <p>Dane przechowujemy tak długo, jak jest to konieczne do realizacji celu lub do czasu żądania usunięcia.</p>
          </div>
          <div>
            <p className="font-semibold">6. Odbiorcy danych</p>
            <p>Dostawcy hostingu, narzędzia do komunikacji (email/SMS) oraz Meta w zakresie integracji IG/FB.</p>
          </div>
          <div>
            <p className="font-semibold">7. Prawa użytkownika</p>
            <p>Prawo dostępu, sprostowania, ograniczenia przetwarzania oraz usunięcia danych.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
