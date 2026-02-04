(() => {
  const script = document.currentScript;
  if (!script) return;
  const orgId = script.getAttribute("data-org");
  const base = script.getAttribute("data-base") || new URL(script.src).origin;
  const targetId = script.getAttribute("data-target") || "inkflow-lead";
  const target = document.getElementById(targetId);
  if (!orgId || !target) return;

  target.innerHTML = `
    <form id="inkflow-form" style="display:grid;gap:8px;padding:12px;border:1px solid #ddd;border-radius:12px;max-width:360px;font-family:system-ui;">
      <input name="name" placeholder="Imię i nazwisko" required />
      <input name="email" type="email" placeholder="Email" />
      <input name="phone" placeholder="Telefon" />
      <textarea name="message" placeholder="Krótki opis" rows="3"></textarea>
      <input name="company" style="display:none" autocomplete="off" />
      <label style="font-size:12px;"><input type="checkbox" name="marketingOptIn" /> Zgoda marketingowa</label>
      <button type="submit" style="background:#ff5a3c;color:#111;padding:8px 12px;border-radius:8px;border:none;font-weight:600;">Wyślij</button>
      <div id="inkflow-status" style="font-size:12px;color:#666"></div>
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
      status.textContent = "Dziękujemy! Odezwę się wkrótce.";
      form.reset();
    } else {
      status.textContent = "Ups, coś poszło nie tak.";
    }
  });
})();
