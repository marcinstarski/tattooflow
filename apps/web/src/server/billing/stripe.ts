import Stripe from "stripe";
import { env, isDevMode } from "@/server/env";
import { prisma } from "@/server/db";

export const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" }) : null;

const planPriceMap = {
  starter: env.STRIPE_PRICE_STARTER,
  pro: env.STRIPE_PRICE_PRO,
  studio: env.STRIPE_PRICE_STUDIO
} as const;

const seatPrice = env.STRIPE_PRICE_SEAT;

export async function createSubscriptionCheckout(orgId: string, plan: "starter" | "pro" | "studio", email: string) {
  if (!stripe || !planPriceMap[plan]) {
    return { url: `${env.PUBLIC_BASE_URL}/app/billing?dev=1` };
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const customerId = org?.stripeCustomerId
    ? org.stripeCustomerId
    : (await stripe.customers.create({ email, name: org?.name })).id;

  if (!org?.stripeCustomerId) {
    await prisma.organization.update({ where: { id: orgId }, data: { stripeCustomerId: customerId } });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: planPriceMap[plan], quantity: 1 }],
    subscription_data: {
      trial_period_days: 14
    },
    success_url: `${env.PUBLIC_BASE_URL}/app/billing?success=1`,
    cancel_url: `${env.PUBLIC_BASE_URL}/app/billing?canceled=1`
  });

  return { url: session.url };
}

export async function createSeatCheckout(orgId: string, email: string) {
  if (!stripe || !seatPrice) {
    if (isDevMode) {
      await prisma.seatSubscription.create({
        data: {
          orgId,
          stripeSubscriptionId: `dev-seat-${Date.now()}`,
          status: "active",
          quantity: 1
        }
      });
    }
    return { url: `${env.PUBLIC_BASE_URL}/app/settings?seat=dev` };
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const customerId = org?.stripeCustomerId
    ? org.stripeCustomerId
    : (await stripe.customers.create({ email, name: org?.name })).id;

  if (!org?.stripeCustomerId) {
    await prisma.organization.update({ where: { id: orgId }, data: { stripeCustomerId: customerId } });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: seatPrice, quantity: 1 }],
    subscription_data: {
      metadata: { type: "seat", orgId }
    },
    metadata: { type: "seat", orgId, quantity: "1" },
    success_url: `${env.PUBLIC_BASE_URL}/app/settings?seat=success`,
    cancel_url: `${env.PUBLIC_BASE_URL}/app/settings?seat=cancelled`
  });

  return { url: session.url };
}

export async function createDepositCheckout(params: {
  orgId: string;
  appointmentId: string;
  amount: number;
  clientEmail?: string;
}) {
  if (!stripe) {
    return { url: `${env.PUBLIC_BASE_URL}/app/calendar?deposit=dev` };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "pln",
        product_data: { name: "Zadatek za tatuaż" },
        unit_amount: params.amount * 100
      },
      quantity: 1
    }],
    customer_email: params.clientEmail,
    metadata: {
      orgId: params.orgId,
      appointmentId: params.appointmentId,
      type: "deposit"
    },
    success_url: `${env.PUBLIC_BASE_URL}/app/calendar?deposit=paid`,
    cancel_url: `${env.PUBLIC_BASE_URL}/app/calendar?deposit=cancelled`
  });

  return { url: session.url };
}

export async function createCustomerPortal(orgId: string) {
  if (!stripe) {
    return { url: `${env.PUBLIC_BASE_URL}/app/billing?portal=dev` };
  }
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org?.stripeCustomerId) {
    throw new Error("Brak customerId");
  }
  const portal = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: env.STRIPE_PORTAL_RETURN_URL || `${env.PUBLIC_BASE_URL}/app/billing`
  });
  return { url: portal.url };
}

export async function handleStripeWebhook(rawBody: string, signature: string | null) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    if (isDevMode) {
      return { received: true };
    }
    throw new Error("Brak Stripe konfiguracji");
  }

  const event = stripe.webhooks.constructEvent(rawBody, signature || "", env.STRIPE_WEBHOOK_SECRET);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        if (session.metadata?.type === "seat" && session.metadata.orgId) {
          const quantity = Number(session.metadata.quantity || "1");
          await prisma.seatSubscription.upsert({
            where: { stripeSubscriptionId: session.subscription as string },
            update: {
              status: "active",
              quantity: Number.isFinite(quantity) ? quantity : 1
            },
            create: {
              orgId: session.metadata.orgId,
              stripeSubscriptionId: session.subscription as string,
              status: "active",
              quantity: Number.isFinite(quantity) ? quantity : 1
            }
          });
        } else {
          await prisma.organization.updateMany({
            where: { stripeCustomerId: session.customer as string },
            data: {
              stripeSubscriptionId: session.subscription as string,
              subscriptionStatus: "active"
            }
          });
        }
      }
      if (session.mode === "payment" && session.metadata?.type === "deposit") {
        const appointmentId = session.metadata.appointmentId;
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            depositStatus: "paid",
            depositPaidAt: new Date()
          }
        });
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.customer) {
        const org = await prisma.organization.findFirst({
          where: { stripeCustomerId: invoice.customer as string }
        });
        await prisma.organization.updateMany({
          where: { stripeCustomerId: invoice.customer as string },
          data: { subscriptionStatus: "active" }
        });
        if (org) {
          await prisma.invoice.create({
            data: {
              orgId: org.id,
              number: invoice.number || invoice.id,
              amount: Math.round((invoice.total || 0) / 100),
              currency: (invoice.currency || "pln").toUpperCase(),
              status: invoice.status || "paid",
              stripeInvoiceId: invoice.id,
              pdfUrl: invoice.invoice_pdf || undefined,
              issuedAt: invoice.status_transitions?.paid_at
                ? new Date(invoice.status_transitions.paid_at * 1000)
                : new Date()
            }
          });
        }
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.metadata?.type === "seat") {
        await prisma.seatSubscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: subscription.status }
        });
        break;
      }
      await prisma.organization.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { subscriptionStatus: subscription.status }
      });
      break;
    }
    default:
      break;
  }

  return { received: true };
}
