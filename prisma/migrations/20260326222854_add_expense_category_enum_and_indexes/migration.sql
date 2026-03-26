-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('HOUSING', 'UTILITIES', 'SUBSCRIPTIONS', 'INSURANCE', 'TRANSPORTATION', 'FOOD', 'EDUCATION', 'HEALTH', 'ENTERTAINMENT', 'PERSONAL', 'PETS', 'DONATIONS', 'OTHER');

-- Clean up empty strings to NULL before casting
UPDATE "Expense" SET "category" = NULL WHERE "category" = '';
UPDATE "RecurringExpense" SET "category" = NULL WHERE "category" = '';

-- AlterTable: convert existing string values to enum (preserves data)
ALTER TABLE "Expense" ALTER COLUMN "category" TYPE "ExpenseCategory" USING "category"::"ExpenseCategory";
ALTER TABLE "RecurringExpense" ALTER COLUMN "category" TYPE "ExpenseCategory" USING "category"::"ExpenseCategory";

-- CreateIndex
CREATE INDEX "Card_userId_type_idx" ON "Card"("userId", "type");
CREATE INDEX "Expense_userId_date_idx" ON "Expense"("userId", "date");
CREATE INDEX "IncomeSource_userId_active_idx" ON "IncomeSource"("userId", "active");
CREATE INDEX "Loan_userId_idx" ON "Loan"("userId");
CREATE INDEX "RecurringExpense_userId_idx" ON "RecurringExpense"("userId");
CREATE INDEX "ShoppingSession_userId_status_idx" ON "ShoppingSession"("userId", "status");
