-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "profileImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_profileImageId_key" ON "Admin"("profileImageId");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_profileImageId_fkey" FOREIGN KEY ("profileImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
