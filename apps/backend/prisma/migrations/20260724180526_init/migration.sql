-- CreateEnum
CREATE TYPE "IdentityType" AS ENUM ('AADHAAR', 'PASSPORT', 'DRIVING_LICENSE', 'PAN', 'OTHER');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('CHECKED_IN', 'CHECKED_OUT');

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "visitorCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "identityType" "IdentityType",
    "identityNumber" TEXT,
    "profileImageId" TEXT,
    "faceRegistered" BOOLEAN NOT NULL DEFAULT false,
    "lastVisitedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'CHECKED_IN',
    "checkInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_counters" (
    "year" INTEGER NOT NULL,
    "lastSequence" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitor_counters_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_emails" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_mobiles" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_mobiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visitors_visitorCode_key" ON "visitors"("visitorCode");

-- CreateIndex
CREATE INDEX "visitors_visitorCode_idx" ON "visitors"("visitorCode");

-- CreateIndex
CREATE INDEX "visitors_firstName_idx" ON "visitors"("firstName");

-- CreateIndex
CREATE INDEX "visitors_lastName_idx" ON "visitors"("lastName");

-- CreateIndex
CREATE INDEX "visits_visitorId_idx" ON "visits"("visitorId");

-- CreateIndex
CREATE INDEX "visits_status_idx" ON "visits"("status");

-- CreateIndex
CREATE INDEX "visits_checkInAt_idx" ON "visits"("checkInAt");

-- CreateIndex
CREATE INDEX "visitor_emails_visitorId_idx" ON "visitor_emails"("visitorId");

-- CreateIndex
CREATE INDEX "visitor_emails_email_idx" ON "visitor_emails"("email");

-- CreateIndex
CREATE INDEX "visitor_mobiles_visitorId_idx" ON "visitor_mobiles"("visitorId");

-- CreateIndex
CREATE INDEX "visitor_mobiles_mobile_idx" ON "visitor_mobiles"("mobile");

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_profileImageId_fkey" FOREIGN KEY ("profileImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_emails" ADD CONSTRAINT "visitor_emails_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_mobiles" ADD CONSTRAINT "visitor_mobiles_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
