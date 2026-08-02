ALTER TABLE "PreRegistration" ADD COLUMN "identityType" "IdentityType", ADD COLUMN "identityNumber" TEXT;
CREATE INDEX "PreRegistration_identityNumber_idx" ON "PreRegistration"("identityNumber");
