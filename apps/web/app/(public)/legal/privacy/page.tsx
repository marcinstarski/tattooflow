export default function PrivacyPage() {
  return (
    <main className="pb-24">
      <section className="mx-auto max-w-3xl py-16">
        <h1 className="text-4xl font-display">Polityka prywatności</h1>
        <p className="mt-4 text-ink-200">Polityka prywatności aplikacji TaFlo CRM</p>
        <p className="mt-2 text-ink-200">Obowiązuje od: 17.02.2026</p>
        <div className="mt-8 space-y-6 text-sm text-ink-200">
          <div>
            <p className="font-semibold">1. Informacje ogólne</p>
            <p>Administratorem danych osobowych jest:</p>
            <p>TaFlo sp. z o.o.</p>
            <p>Adres: Smyków, ul. Lipowa 2A, 33-206</p>
            <p>E-mail kontaktowy: taflospzoo@gmail.com</p>
            <p className="mt-3">
              Aplikacja TaFlo CRM jest narzędziem przeznaczonym dla studiów tatuażu, umożliwiającym zarządzanie klientami,
              rezerwacjami, projektami oraz komunikacją z wykorzystaniem platform Meta (Facebook i Instagram). Aplikacja znajduje
              się obecnie w fazie testowej (beta).
            </p>
          </div>
          <div>
            <p className="font-semibold">2. Zakres przetwarzanych danych</p>
            <p>W ramach działania aplikacji przetwarzane mogą być następujące dane:</p>
            <p className="mt-3 font-semibold">Dane użytkowników aplikacji (właścicieli/pracowników studiów tatuażu):</p>
            <p>imię i nazwisko,</p>
            <p>adres e-mail,</p>
            <p>identyfikator konta Meta (Facebook/Instagram),</p>
            <p>dane powiązanych stron i profili firmowych.</p>
            <p className="mt-3 font-semibold">Dane klientów studia tatuażu (wprowadzane przez użytkownika aplikacji):</p>
            <p>imię i nazwisko,</p>
            <p>numer telefonu,</p>
            <p>adres e-mail,</p>
            <p>termin wizyty,</p>
            <p>notatki dotyczące realizacji usługi,</p>
            <p>opcjonalnie: zdjęcia projektów tatuaży.</p>
            <p className="mt-3">
              W przypadku integracji z Meta (Facebook/Instagram) możemy pobierać z tych platform podstawowe dane profilu
              rozmówcy (np. imię/nazwa profilu) wyłącznie w celu identyfikacji klienta i obsługi korespondencji.
            </p>
          </div>
          <div>
            <p className="font-semibold">3. Cel przetwarzania danych</p>
            <p>Dane osobowe są przetwarzane w celu:</p>
            <p>świadczenia usług CRM (zarządzanie klientami, wizytami i projektami),</p>
            <p>umożliwienia logowania do aplikacji za pomocą kont Meta,</p>
            <p>integracji z Facebookiem i Instagramem (np. obsługa wiadomości),</p>
            <p>poprawy działania aplikacji oraz rozwoju funkcjonalności,</p>
            <p>zapewnienia bezpieczeństwa i obsługi zgłoszeń technicznych.</p>
          </div>
          <div>
            <p className="font-semibold">4. Podstawa prawna przetwarzania danych</p>
            <p>Dane są przetwarzane na podstawie:</p>
            <p>zgody użytkownika (art. 6 ust. 1 lit. a RODO),</p>
            <p>realizacji umowy / świadczenia usługi (art. 6 ust. 1 lit. b RODO),</p>
            <p>prawnie uzasadnionego interesu administratora (art. 6 ust. 1 lit. f RODO),</p>
            <p>obowiązków prawnych, jeśli takie wystąpią.</p>
          </div>
          <div>
            <p className="font-semibold">5. Odbiorcy danych</p>
            <p>Dane mogą być przekazywane wyłącznie:</p>
            <p>dostawcom hostingu i infrastruktury IT,</p>
            <p>podmiotom świadczącym usługi utrzymania systemów,</p>
            <p>platformom Meta (Facebook, Instagram) w zakresie niezbędnym do integracji API.</p>
            <p>Dane nie są sprzedawane ani udostępniane podmiotom trzecim w celach marketingowych.</p>
          </div>
          <div>
            <p className="font-semibold">6. Okres przechowywania danych</p>
            <p>Dane są przechowywane:</p>
            <p>przez czas trwania korzystania z aplikacji,</p>
            <p>do momentu usunięcia konta przez użytkownika,</p>
            <p>lub do momentu cofnięcia zgody – o ile przepisy prawa nie wymagają dłuższego przechowywania.</p>
          </div>
          <div>
            <p className="font-semibold">7. Prawa użytkownika</p>
            <p>Każda osoba, której dane są przetwarzane, ma prawo do:</p>
            <p>dostępu do danych,</p>
            <p>ich poprawiania,</p>
            <p>usunięcia („prawo do bycia zapomnianym”),</p>
            <p>ograniczenia przetwarzania,</p>
            <p>przenoszenia danych,</p>
            <p>wniesienia sprzeciwu,</p>
            <p>cofnięcia zgody w dowolnym momencie.</p>
          </div>
          <div>
            <p className="font-semibold">8. Usunięcie danych / konta (wymagane przez Meta)</p>
            <p>Użytkownik może w każdej chwili zażądać usunięcia swojego konta oraz danych osobowych poprzez:</p>
            <p>kontakt mailowy: taflospzoo@gmail.com</p>
            <p>Żądanie zostanie zrealizowane niezwłocznie, nie później niż w terminie 30 dni.</p>
          </div>
          <div>
            <p className="font-semibold">9. Bezpieczeństwo danych</p>
            <p>
              Administrator stosuje odpowiednie środki techniczne i organizacyjne w celu ochrony danych osobowych przed utratą,
              nieuprawnionym dostępem, modyfikacją lub ujawnieniem.
            </p>
          </div>
          <div>
            <p className="font-semibold">10. Zmiany polityki prywatności</p>
            <p>
              Polityka prywatności może być aktualizowana wraz z rozwojem funkcjonalności aplikacji TaFlo CRM. Aktualna wersja
              polityki będzie zawsze dostępna pod adresem: taflo.app/polityka-prywatnosci
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
