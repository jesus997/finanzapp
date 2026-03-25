-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "address" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
