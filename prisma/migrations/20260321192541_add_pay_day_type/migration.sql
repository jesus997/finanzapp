-- CreateEnum
CREATE TYPE "PayDayType" AS ENUM ('DAY_OF_MONTH', 'DAY_OF_WEEK');

-- AlterTable
ALTER TABLE "IncomeSource" ADD COLUMN     "payDayType" "PayDayType" NOT NULL DEFAULT 'DAY_OF_MONTH';
