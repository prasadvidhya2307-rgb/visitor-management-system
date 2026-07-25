/*
  Warnings:

  - A unique constraint covering the columns `[identityNumber]` on the table `visitors` will be added. If there are existing duplicate values, this will fail.
  - Made the column `identityType` on table `visitors` required. This step will fail if there are existing NULL values in that column.
  - Made the column `identityNumber` on table `visitors` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "visitors" ALTER COLUMN "identityType" SET NOT NULL,
ALTER COLUMN "identityNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "visitors_identityNumber_key" ON "visitors"("identityNumber");
