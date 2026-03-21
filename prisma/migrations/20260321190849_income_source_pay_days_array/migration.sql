/*
  Warnings:

  - The `payDay` column on the `IncomeSource` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "IncomeSource" DROP COLUMN "payDay",
ADD COLUMN     "payDay" INTEGER[];
