import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId, requireRole } from "@/server/tenant";

export async function GET() {
  const orgId = await requireOrgId();
  const role = await requireRole();
  if (role !== "owner") {
    return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
  }

  const memberships = await prisma.membership.findMany({
    where: { orgId, role: "owner" },
    include: { user: true },
    orderBy: { createdAt: "asc" }
  });

  const managers = memberships.map((membership) => ({
    id: membership.userId,
    name: membership.user?.name || membership.user?.email || "—",
    email: membership.user?.email || "—",
    createdAt: membership.createdAt
  }));

  return NextResponse.json(managers);
}
