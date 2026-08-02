ALTER TABLE "employees" ADD COLUMN "profileImageId" TEXT;
CREATE UNIQUE INDEX "employees_profileImageId_key" ON "employees"("profileImageId");
ALTER TABLE "employees" ADD CONSTRAINT "employees_profileImageId_fkey" FOREIGN KEY ("profileImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
