/*
  Warnings:

  - The values [qualified] on the enum `LeadStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LeadStatus_new" AS ENUM ('new', 'contacted', 'booked', 'lost');
ALTER TABLE "Lead" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Lead" ALTER COLUMN "status" TYPE "LeadStatus_new" USING ("status"::text::"LeadStatus_new");
ALTER TYPE "LeadStatus" RENAME TO "LeadStatus_old";
ALTER TYPE "LeadStatus_new" RENAME TO "LeadStatus";
DROP TYPE "LeadStatus_old";
ALTER TABLE "Lead" ALTER COLUMN "status" SET DEFAULT 'new';
COMMIT;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "fbUserId" TEXT,
ADD COLUMN     "igUserId" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "artistId" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "artistId" TEXT;

-- AlterTable
ALTER TABLE "Settings" ALTER COLUMN "templateDeposit" SET DEFAULT 'Cześć:) Podsyłam tutaj link do zadatku na naszą sesję: {{depositLink}}';

-- CreateTable
CREATE TABLE "ArtistIntegration" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "userAccessToken" TEXT,
    "userTokenExpiresAt" TIMESTAMP(3),
    "pageId" TEXT,
    "pageName" TEXT,
    "pageAccessToken" TEXT,
    "igBusinessAccountId" TEXT,
    "connectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtistIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatSubscription" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtistIntegration_artistId_key" ON "ArtistIntegration"("artistId");

-- CreateIndex
CREATE INDEX "ArtistIntegration_orgId_idx" ON "ArtistIntegration"("orgId");

-- CreateIndex
CREATE INDEX "ArtistIntegration_pageId_idx" ON "ArtistIntegration"("pageId");

-- CreateIndex
CREATE INDEX "ArtistIntegration_igBusinessAccountId_idx" ON "ArtistIntegration"("igBusinessAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatSubscription_stripeSubscriptionId_key" ON "SeatSubscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "SeatSubscription_orgId_status_idx" ON "SeatSubscription"("orgId", "status");

-- CreateIndex
CREATE INDEX "Client_orgId_igUserId_idx" ON "Client"("orgId", "igUserId");

-- CreateIndex
CREATE INDEX "Client_orgId_fbUserId_idx" ON "Client"("orgId", "fbUserId");

-- CreateIndex
CREATE INDEX "Lead_orgId_artistId_idx" ON "Lead"("orgId", "artistId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistIntegration" ADD CONSTRAINT "ArtistIntegration_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistIntegration" ADD CONSTRAINT "ArtistIntegration_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatSubscription" ADD CONSTRAINT "SeatSubscription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
