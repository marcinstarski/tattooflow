export default function PrivacyPage() {
  return (
    <main className="pb-24">
      <section className="mx-auto max-w-3xl py-16">
        <h1 className="text-4xl font-display">Polityka prywatności</h1>
        <p className="mt-4 text-ink-200">Polityka prywatności aplikacji TaFlo CRM</p>
        <p className="mt-2 text-ink-200">Obowiązuje od: 17.02.2026</p>
        <div className="mt-8 space-y-6 text-sm text-ink-200">
          <div>
            <p className="font-semibold">1. Administrator danych</p>
            <p>TaFlo sp. z o.o.</p>
            <p>Smyków, ul. Lipowa 2, 33-206</p>
            <p>E-mail kontaktowy: taflospzoo@gmail.com</p>
          </div>
          <div>
            <p className="font-semibold">2. Zakres działalności</p>
            <p>
              TaFlo CRM to aplikacja dla studiów tatuażu, służąca do zarządzania klientami, wizytami i komunikacją
              (w tym integracji z Facebook/Instagram). Usługa jest skierowana do firm (B2B) i klientów indywidualnych (B2C).
            </p>
          </div>
          <div>
            <p className="font-semibold">3. Jakie dane przetwarzamy</p>
            <p className="mt-3 font-semibold">Dane użytkowników aplikacji:</p>
            <p>imię i nazwisko,</p>
            <p>adres e-mail,</p>
            <p>numer telefonu,</p>
            <p>dane firmowe,</p>
            <p>dane kont powiązanych z Meta (Facebook/Instagram).</p>
            <p className="mt-3 font-semibold">Dane klientów studia tatuażu:</p>
            <p>imię i nazwisko,</p>
            <p>adres e-mail,</p>
            <p>numer telefonu,</p>
            <p>dane firmowe (jeśli podane),</p>
            <p>treść wiadomości z Facebooka i Instagrama oraz imiona/nazwy profili,</p>
            <p>zdjęcia i załączniki (np. projekty tatuażu).</p>
            <p className="mt-3 font-semibold">Formularz kontaktowy (embed na stronie studia):</p>
            <p>imię i nazwisko,</p>
            <p>numer telefonu,</p>
            <p>adres e-mail,</p>
            <p>treść wiadomości,</p>
            <p>zgody marketingowe (jeśli zostały zaznaczone).</p>
            <p className="mt-3 font-semibold">Dane płatności / fakturowania:</p>
            <p>dane niezbędne do rozliczeń i wystawiania faktur.</p>
          </div>
          <div>
            <p className="font-semibold">4. Cel przetwarzania danych</p>
            <p>świadczenie usług CRM,</p>
            <p>zarządzanie klientami, wizytami i komunikacją,</p>
            <p>integracja z Facebook/Instagram,</p>
            <p>wysyłka wiadomości (e-mail/SMS/Meta),</p>
            <p>obsługa rozliczeń i faktur,</p>
            <p>zapewnienie bezpieczeństwa i obsługa zgłoszeń.</p>
          </div>
          <div>
            <p className="font-semibold">5. Podstawa prawna</p>
            <p>art. 6 ust. 1 lit. b RODO – realizacja umowy/usługi,</p>
            <p>art. 6 ust. 1 lit. c RODO – obowiązki prawne,</p>
            <p>art. 6 ust. 1 lit. f RODO – uzasadniony interes administratora,</p>
            <p>art. 6 ust. 1 lit. a RODO – zgoda (gdy wymagana).</p>
          </div>
          <div>
            <p className="font-semibold">6. Odbiorcy danych</p>
            <p>Railway (baza danych),</p>
            <p>Vercel (hosting aplikacji),</p>
            <p>Resend (e-maile),</p>
            <p>SMSAPI (SMS, planowane),</p>
            <p>Meta Platforms (Facebook/Instagram API).</p>
            <p>Dane nie są sprzedawane ani udostępniane podmiotom trzecim w celach marketingowych.</p>
          </div>
          <div>
            <p className="font-semibold">7. Lokalizacja danych</p>
            <p>Dane są hostowane na terenie UE. Nie przekazujemy danych poza EOG, o ile nie wymagają tego integracje.</p>
          </div>
          <div>
            <p className="font-semibold">8. Okres przechowywania</p>
            <p>Przez czas korzystania z aplikacji,</p>
            <p>do momentu usunięcia konta,</p>
            <p>lub przez okres wymagany przepisami prawa (np. do 5 lat dla rozliczeń).</p>
          </div>
          <div>
            <p className="font-semibold">9. Prawa użytkownika</p>
            <p>dostęp do danych, poprawianie, usunięcie, ograniczenie przetwarzania, przenoszenie danych, sprzeciw, cofnięcie zgody.</p>
          </div>
          <div>
            <p className="font-semibold">10. Usunięcie danych / konta</p>
            <p>Wnioski o usunięcie danych: taflospzoo@gmail.com</p>
            <p>Wniosek realizowany maksymalnie w 30 dni.</p>
          </div>
          <div>
            <p className="font-semibold">11. Cookies</p>
            <p>Aktualnie używamy wyłącznie cookies technicznych. W przyszłości mogą zostać dodane analityczne.</p>
          </div>
          <div>
            <p className="font-semibold">12. Zmiany polityki</p>
            <p>Aktualna wersja polityki jest publikowana w tym miejscu.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
