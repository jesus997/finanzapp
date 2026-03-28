-- DropForeignKey
ALTER TABLE "SavingsFund" DROP CONSTRAINT "SavingsFund_incomeSourceId_fkey";

-- AlterTable
ALTER TABLE "SavingsFund" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "targetAmount" DECIMAL(65,30),
ADD COLUMN     "targetDate" TIMESTAMP(3),
ALTER COLUMN "incomeSourceId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "SavingsFund_userId_idx" ON "SavingsFund"("userId");

-- AddForeignKey
ALTER TABLE "SavingsFund" ADD CONSTRAINT "SavingsFund_incomeSourceId_fkey" FOREIGN KEY ("incomeSourceId") REFERENCES "IncomeSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
