import { NextResponse } from "next/server";
import { requireOrgId } from "@/server/tenant";
import { prisma } from "@/server/db";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const MAX_MB = 10;

function getAppRoot() {
  const cwd = process.cwd();
  const suffix = path.join("apps", "web");
  return cwd.endsWith(suffix) ? cwd : path.join(cwd, suffix);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const orgId = await requireOrgId();
  const formData = await req.formData();
  const note = (formData.get("note") as string | null) || undefined;
  const albumId = (formData.get("albumId") as string | null) || undefined;
  const source = (formData.get("source") as string | null) || "client";
  const files = formData.getAll("files").filter(Boolean) as File[];

  if (!files.length) {
    return NextResponse.json({ error: "Brak plików" }, { status: 400 });
  }

  const uploadDir = path.join(getAppRoot(), "public/uploads", orgId, params.id);
  await fs.mkdir(uploadDir, { recursive: true });

  const assets = [] as Array<{ id: string; url: string }>;

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Dozwolone tylko obrazy" }, { status: 400 });
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return NextResponse.json({ error: `Max ${MAX_MB}MB` }, { status: 400 });
    }

    const ext = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${orgId}/${params.id}/${filename}`;
    const asset = await prisma.clientAsset.create({
      data: {
        orgId,
        clientId: params.id,
        albumId: albumId || undefined,
        url,
        note,
        source
      }
    });

    assets.push({ id: asset.id, url: asset.url });
  }

  return NextResponse.json({ assets });
}
