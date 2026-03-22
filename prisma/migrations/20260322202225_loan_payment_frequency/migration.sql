-- RenameColumn
ALTER TABLE "Loan" RENAME COLUMN "monthlyPayment" TO "paymentAmount";

-- AddColumn
ALTER TABLE "Loan" ADD COLUMN "paymentFrequency" "Frequency" NOT NULL DEFAULT 'MONTHLY';
