/*
  Warnings:

  - Added the required column `floor` to the `PreRegistration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PreRegistration" ADD COLUMN     "floor" INTEGER NOT NULL,
ADD COLUMN     "notes" TEXT,
ALTER COLUMN "isRecurring" SET DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'PENDING';
