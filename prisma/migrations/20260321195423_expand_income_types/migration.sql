-- AlterEnum
ALTER TYPE "Frequency" ADD VALUE 'ONE_TIME';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IncomeType" ADD VALUE 'BONUS';
ALTER TYPE "IncomeType" ADD VALUE 'CHRISTMAS_BONUS';
ALTER TYPE "IncomeType" ADD VALUE 'PROFIT_SHARING';
ALTER TYPE "IncomeType" ADD VALUE 'SAVINGS_FUND';
ALTER TYPE "IncomeType" ADD VALUE 'WINDFALL';

-- AlterTable
ALTER TABLE "IncomeSource" ADD COLUMN     "isVariable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "oneTimeDate" TIMESTAMP(3);
