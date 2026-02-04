-- AlterTable
ALTER TABLE "ClientAsset" ADD COLUMN     "albumId" TEXT;

-- CreateTable
CREATE TABLE "ClientAlbum" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientAlbum_orgId_clientId_idx" ON "ClientAlbum"("orgId", "clientId");

-- AddForeignKey
ALTER TABLE "ClientAsset" ADD CONSTRAINT "ClientAsset_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "ClientAlbum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAlbum" ADD CONSTRAINT "ClientAlbum_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAlbum" ADD CONSTRAINT "ClientAlbum_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
