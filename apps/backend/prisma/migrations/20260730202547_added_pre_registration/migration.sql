-- CreateEnum
CREATE TYPE "PreRegistrationStatus" AS ENUM ('PENDING', 'CHECKED_IN', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "PreRegistration" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "hostEmployeeId" TEXT NOT NULL,
    "purpose" "VisitPurpose" NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL,
    "status" "PreRegistrationStatus" NOT NULL,
    "visitorId" TEXT,
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreRegistration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PreRegistration" ADD CONSTRAINT "PreRegistration_hostEmployeeId_fkey" FOREIGN KEY ("hostEmployeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreRegistration" ADD CONSTRAINT "PreRegistration_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
