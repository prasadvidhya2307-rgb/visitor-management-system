-- CreateEnum
CREATE TYPE "WorkflowStep" AS ENUM ('CREATE_MEDIA', 'CREATE_VISITOR', 'REGISTER_FACE', 'COMPLETE_REGISTRATION', 'CREATE_VISIT', 'ACTIVATE_MEDIA', 'COMPLETED');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('RUNNING', 'FAILED', 'COMPLETED');

-- CreateTable
CREATE TABLE "visitor_registration_workflows" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT,
    "currentStep" "WorkflowStep" NOT NULL,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'RUNNING',
    "createMediaCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createVisitorCompleted" BOOLEAN NOT NULL DEFAULT false,
    "registerFaceCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completeRegistrationCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createVisitCompleted" BOOLEAN NOT NULL DEFAULT false,
    "activateMediaCompleted" BOOLEAN NOT NULL DEFAULT false,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitor_registration_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visitor_registration_workflows_visitorId_idx" ON "visitor_registration_workflows"("visitorId");

-- CreateIndex
CREATE INDEX "visitor_registration_workflows_status_idx" ON "visitor_registration_workflows"("status");

-- CreateIndex
CREATE INDEX "visitor_registration_workflows_currentStep_idx" ON "visitor_registration_workflows"("currentStep");

-- AddForeignKey
ALTER TABLE "visitor_registration_workflows" ADD CONSTRAINT "visitor_registration_workflows_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
