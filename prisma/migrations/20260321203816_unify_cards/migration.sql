/*
  Warnings:

  - You are about to drop the `CreditCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DebitCard` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "CardNetwork" AS ENUM ('VISA', 'MASTERCARD', 'AMEX', 'OTHER');

-- DropForeignKey
ALTER TABLE "CreditCard" DROP CONSTRAINT "CreditCard_userId_fkey";

-- DropForeignKey
ALTER TABLE "DebitCard" DROP CONSTRAINT "DebitCard_incomeSourceId_fkey";

-- DropForeignKey
ALTER TABLE "DebitCard" DROP CONSTRAINT "DebitCard_userId_fkey";

-- DropTable
DROP TABLE "CreditCard";

-- DropTable
DROP TABLE "DebitCard";

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "lastFourDigits" TEXT NOT NULL,
    "type" "CardType" NOT NULL,
    "network" "CardNetwork" NOT NULL DEFAULT 'OTHER',
    "creditLimit" DECIMAL(65,30),
    "cutOffDay" INTEGER,
    "paymentDay" INTEGER,
    "interestRate" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
