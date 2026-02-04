import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Brak tokenu" }, { status: 400 });
  }
  await prisma.client.updateMany({
    where: { unsubscribeToken: token },
    data: { marketingOptIn: false, unsubscribedAt: new Date() }
  });
  return NextResponse.json({ ok: true });
}
