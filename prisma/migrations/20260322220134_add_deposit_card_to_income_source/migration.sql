-- AlterTable
ALTER TABLE "IncomeSource" ADD COLUMN     "depositCardId" TEXT;

-- AddForeignKey
ALTER TABLE "IncomeSource" ADD CONSTRAINT "IncomeSource_depositCardId_fkey" FOREIGN KEY ("depositCardId") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;
