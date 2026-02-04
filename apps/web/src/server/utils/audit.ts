import { prisma } from "@/server/db";

export async function logAudit(params: {
  orgId: string;
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      orgId: params.orgId,
      actorId: params.actorId || undefined,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId || undefined,
      metadata: params.metadata
    }
  });
}
