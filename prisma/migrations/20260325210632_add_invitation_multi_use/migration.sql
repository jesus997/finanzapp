-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "label" TEXT,
ADD COLUMN     "maxUses" INTEGER,
ADD COLUMN     "useCount" INTEGER NOT NULL DEFAULT 0;
