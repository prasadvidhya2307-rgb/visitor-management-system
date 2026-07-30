/*
  Warnings:

  - Added the required column `floor` to the `visits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hostEmployeeId` to the `visits` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `purpose` on the `visits` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Department" AS ENUM ('ENGINEERING', 'HR', 'FINANCE', 'MARKETING', 'OPERATIONS', 'LEGAL', 'SALES', 'IT', 'ADMIN');

-- CreateEnum
CREATE TYPE "VisitPurpose" AS ENUM ('TECHNICAL_DISCUSSION', 'INTERVIEW', 'BUSINESS_MEETING', 'CONTRACT_NEGOTIATION', 'DESIGN_REVIEW', 'TRAINING', 'AUDIT', 'DELIVERY', 'MAINTENANCE', 'OTHER');

-- AlterTable
ALTER TABLE "visits" ADD COLUMN     "floor" INTEGER NOT NULL,
ADD COLUMN     "hostEmployeeId" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
DROP COLUMN "purpose",
ADD COLUMN     "purpose" "VisitPurpose" NOT NULL;

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "designation" TEXT,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_mobile_key" ON "employees"("mobile");

-- CreateIndex
CREATE INDEX "employees_department_idx" ON "employees"("department");

-- CreateIndex
CREATE INDEX "employees_email_idx" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_mobile_idx" ON "employees"("mobile");

-- CreateIndex
CREATE INDEX "visits_hostEmployeeId_idx" ON "visits"("hostEmployeeId");

-- CreateIndex
CREATE INDEX "visits_purpose_idx" ON "visits"("purpose");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_hostEmployeeId_fkey" FOREIGN KEY ("hostEmployeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
