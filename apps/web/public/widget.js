(() => {
  const script = document.currentScript;
  if (!script) return;
  const orgId = script.getAttribute("data-org");
  const base = script.getAttribute("data-base") || new URL(script.src).origin;
  const targetId = script.getAttribute("data-target") || "inkflow-lead";
  const target = document.getElementById(targetId);
  if (!orgId || !target) return;

  target.innerHTML = `
    <style>
      .taflo-widget {
        display: grid;
        gap: 12px;
        padding: 16px;
        border: 1px solid rgba(0,0,0,0.08);
        border-radius: 16px;
        max-width: 420px;
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #ffffff;
        box-shadow: 0 12px 30px rgba(0,0,0,0.08);
      }
      .taflo-widget h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #0f172a;
      }
      .taflo-widget p {
        margin: 0;
        font-size: 13px;
        color: #475569;
      }
      .taflo-field {
        display: grid;
        gap: 6px;
      }
      .taflo-label {
        font-size: 12px;
        color: #64748b;
      }
      .taflo-input,
      .taflo-textarea {
        width: 100%;
        border: 1px solid rgba(15,23,42,0.12);
        border-radius: 12px;
        padding: 10px 12px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        background: #f8fafc;
        color: #0f172a;
      }
      .taflo-input:focus,
      .taflo-textarea:focus {
        border-color: #0ea5e9;
        box-shadow: 0 0 0 3px rgba(14,165,233,0.2);
        background: #ffffff;
      }
      .taflo-row {
        display: grid;
        gap: 10px;
      }
      .taflo-consent {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        font-size: 12px;
        color: #475569;
      }
      .taflo-button {
        background: #0ea5e9;
        color: #ffffff;
        padding: 10px 14px;
        border-radius: 12px;
        border: none;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: transform 0.1s ease, box-shadow 0.2s ease, background 0.2s ease;
      }
      .taflo-button:hover {
        background: #0284c7;
        box-shadow: 0 10px 20px rgba(2,132,199,0.25);
      }
      .taflo-button:active {
        transform: translateY(1px);
      }
      #inkflow-status {
        font-size: 12px;
        color: #64748b;
      }
    </style>
    <form id="inkflow-form" class="taflo-widget">
      <div>
        <h3>Umów konsultację</h3>
        <p>Podaj kontakt, a wrócimy z propozycją terminu.</p>
      </div>
      <div class="taflo-row">
        <div class="taflo-field">
          <span class="taflo-label">Imię i nazwisko</span>
          <input class="taflo-input" name="name" placeholder="Jan Kowalski" required />
        </div>
        <div class="taflo-field">
          <span class="taflo-label">Email</span>
          <input class="taflo-input" name="email" type="email" placeholder="email@adres.pl" />
        </div>
        <div class="taflo-field">
          <span class="taflo-label">Telefon</span>
          <input class="taflo-input" name="phone" placeholder="+48 600 000 000" />
        </div>
        <div class="taflo-field">
          <span class="taflo-label">Krótki opis</span>
          <textarea class="taflo-textarea" name="message" placeholder="Styl, miejsce, rozmiar..." rows="4"></textarea>
        </div>
      </div>
      <input name="company" style="display:none" autocomplete="off" />
      <label class="taflo-consent">
        <input type="checkbox" name="marketingOptIn" />
        Chcę otrzymywać informacje marketingowe i akceptuję politykę prywatności.
      </label>
      <button type="submit" class="taflo-button">Wyślij zapytanie</button>
      <div id="inkflow-status"></div>
    </form>
  `;

  const form = target.querySelector("#inkflow-form");
  const status = target.querySelector("#inkflow-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.orgId = orgId;
    payload.honeypot = payload.company;
    delete payload.company;
    payload.marketingOptIn = formData.get("marketingOptIn") === "on";

    const res = await fetch(`${base}/api/public/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      status.textContent = "Dziękujemy! Wrócimy do Ciebie z terminem.";
      form.reset();
    } else {
      status.textContent = "Nie udało się wysłać. Spróbuj ponownie.";
    }
  });
})();
