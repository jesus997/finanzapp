-- CreateEnum
CREATE TYPE "SavingsMovementType" AS ENUM ('DEPOSIT', 'WITHDRAWAL');

-- CreateTable
CREATE TABLE "SavingsMovement" (
    "id" TEXT NOT NULL,
    "savingsFundId" TEXT NOT NULL,
    "type" "SavingsMovementType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "note" TEXT,
    "distributionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsMovement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavingsMovement" ADD CONSTRAINT "SavingsMovement_savingsFundId_fkey" FOREIGN KEY ("savingsFundId") REFERENCES "SavingsFund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsMovement" ADD CONSTRAINT "SavingsMovement_distributionId_fkey" FOREIGN KEY ("distributionId") REFERENCES "Distribution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
