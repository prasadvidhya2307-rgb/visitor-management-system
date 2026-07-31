-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "PreRegistration" ADD COLUMN     "recurrenceType" "RecurrenceType" NOT NULL DEFAULT 'NONE';
