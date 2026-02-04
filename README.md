# InkFlow CRM – MVP SaaS dla tatuatorów

## Stack
- Next.js App Router + TypeScript + Tailwind
- Prisma + PostgreSQL
- Redis + BullMQ
- NextAuth (email + magic link + hasło)
- Stripe Billing (PLN)
- Resend / Twilio

## Szybki start (lokalnie)
1. `pnpm install`
2. `cp apps/web/.env.example apps/web/.env`
3. `docker compose up -d`
4. `pnpm prisma:generate`
5. `pnpm prisma:migrate`
6. `pnpm seed`
7. `pnpm dev`
8. W osobnym terminalu: `pnpm worker`

Demo login: `demo@inkflow.pl` / `demo1234`

## Widget leadów
Wstaw na stronę:
```html
<div id="inkflow-lead"></div>
<script src="/widget.js" data-org="ORG_ID"></script>
```

## Publiczny formularz leadów
`/lead/ORG_ID` — gotowy link do wysyłania zapytań.

## Stripe (prod)
- Ustaw `STRIPE_SECRET_KEY` i ceny `STRIPE_PRICE_*`
- Webhook: `/api/stripe/webhook`
- Events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`

## Instagram + Facebook (Meta)
1. Ustaw w `.env`: `META_APP_ID`, `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN`.
2. W panelu Meta dodaj redirect URL: `/api/integrations/instagram/callback`.
3. W panelu Webhooks ustaw endpoint: `/api/integrations/instagram/webhook`.
4. W aplikacji wejdź w Ustawienia i kliknij “Połącz Instagram i Facebook”.

## Deploy (propozycja)
- Vercel: aplikacja web
- Railway/Fly.io: PostgreSQL + Redis

### Kroki
1. Utwórz bazę i Redis na Railway.
2. Skopiuj connection strings do ENV na Vercel.
3. Dodaj env Stripe/Resend/Twilio.
4. Włącz worker na Railway/Fly.io (komenda: `pnpm worker`).

## Testy
`pnpm test` (wymaga `DATABASE_URL` i `REDIS_URL`).

## Dev mode
Jeśli brak kluczy integracji, ustaw `DEV_MODE=1` i system zapisze wysyłki w tabeli `Outbox` + logi.
