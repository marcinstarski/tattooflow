import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("demo1234", 10);
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const org = await prisma.organization.create({
    data: {
      name: "Demo Tattoo Studio",
      timezone: "Europe/Warsaw",
      currency: "PLN",
      plan: "starter",
      trialEndsAt,
      settings: {
        create: {
          depositType: "fixed",
          depositValue: 200,
          depositDueDays: 7,
          templateDeposit: "Cześć:) Podsyłam tutaj link do zadatku na naszą sesję: {{depositLink}}"
        }
      }
    }
  });

  const user = await prisma.user.create({
    data: {
      email: "demo@inkflow.pl",
      passwordHash,
      name: "Demo Owner",
      memberships: {
        create: { orgId: org.id, role: "owner" }
      }
    }
  });

  const artist = await prisma.artist.create({
    data: {
      orgId: org.id,
      name: "Kasia Ink",
      email: "kasia@inkflow.pl",
      phone: "+48123123123",
      userId: user.id
    }
  });

  const client = await prisma.client.create({
    data: {
      orgId: org.id,
      name: "Marek Kowalski",
      email: "marek@example.com",
      phone: "+48500111222",
      marketingOptIn: true
    }
  });

  await prisma.lead.create({
    data: {
      orgId: org.id,
      artistId: artist.id,
      name: "Marta Nowak",
      email: "marta@example.com",
      phone: "+48666111222",
      source: "instagram",
      status: "new",
      message: "Chcę tatuaż na przedramieniu"
    }
  });

  await prisma.appointment.create({
    data: {
      orgId: org.id,
      clientId: client.id,
      artistId: artist.id,
      startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      price: 1200,
      status: "scheduled",
      depositRequired: true,
      depositAmount: 200,
      depositDueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    }
  });

  console.log("Seed completed for org", org.id);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
