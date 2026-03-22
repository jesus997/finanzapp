-- AlterTable
ALTER TABLE "RecurringExpense" ADD COLUMN     "payDay" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
