ALTER TABLE "visitors" ADD COLUMN "company" TEXT;

ALTER TABLE "visits"
ADD COLUMN "checkInImageId" TEXT,
ADD COLUMN "checkOutImageId" TEXT;

CREATE UNIQUE INDEX "visits_checkInImageId_key" ON "visits"("checkInImageId");
CREATE UNIQUE INDEX "visits_checkOutImageId_key" ON "visits"("checkOutImageId");

ALTER TABLE "visits" ADD CONSTRAINT "visits_checkInImageId_fkey"
FOREIGN KEY ("checkInImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "visits" ADD CONSTRAINT "visits_checkOutImageId_fkey"
FOREIGN KEY ("checkOutImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "system_settings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "companyName" TEXT NOT NULL DEFAULT '',
  "maxVisitHours" INTEGER NOT NULL DEFAULT 8,
  "requirePhoto" BOOLEAN NOT NULL DEFAULT true,
  "autoCheckoutHours" INTEGER NOT NULL DEFAULT 12,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);
