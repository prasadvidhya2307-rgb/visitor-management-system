/*
  Warnings:

  - You are about to drop the column `profileImageId` on the `visitors` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('TEMPORARY', 'ACTIVE');

-- DropForeignKey
ALTER TABLE "visitors" DROP CONSTRAINT "visitors_profileImageId_fkey";

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "status" "MediaStatus" NOT NULL DEFAULT 'TEMPORARY';

-- AlterTable
ALTER TABLE "visitors" DROP COLUMN "profileImageId",
ADD COLUMN     "registrationImageId" TEXT,
ADD COLUMN     "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "media_status_idx" ON "media"("status");

-- CreateIndex
CREATE INDEX "visitors_registrationStatus_idx" ON "visitors"("registrationStatus");

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_registrationImageId_fkey" FOREIGN KEY ("registrationImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
