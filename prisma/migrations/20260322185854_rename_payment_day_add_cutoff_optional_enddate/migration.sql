-- RenameColumn
ALTER TABLE "Loan" RENAME COLUMN "paymentDay" TO "paymentDueDay";

-- AlterTable
ALTER TABLE "Loan" ADD COLUMN "cutOffDay" INTEGER,
ALTER COLUMN "endDate" DROP NOT NULL;
