import { NextResponse } from "next/server";
import { requireOrgId } from "@/server/tenant";
import { createCustomerPortal } from "@/server/billing/stripe";

export async function POST() {
  const orgId = await requireOrgId();
  const portal = await createCustomerPortal(orgId);
  return NextResponse.json(portal);
}
