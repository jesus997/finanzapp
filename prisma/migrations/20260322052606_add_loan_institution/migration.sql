-- AlterTable
ALTER TABLE "Loan" ADD COLUMN "institution" TEXT NOT NULL DEFAULT '';
-- Backfill done, remove default
ALTER TABLE "Loan" ALTER COLUMN "institution" DROP DEFAULT;
