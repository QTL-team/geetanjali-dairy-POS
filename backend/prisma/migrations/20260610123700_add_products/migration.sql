/*
  Warnings:

  - You are about to alter the column `sellingPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- CreateEnum
CREATE TYPE "public"."InventoryTransactionType" AS ENUM ('ADD', 'RESERVE', 'RETURN', 'ADJUSTMENT');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "description" TEXT,
ALTER COLUMN "sellingPrice" SET DATA TYPE DECIMAL(10,2);

-- CreateTable
CREATE TABLE "public"."InventoryTransaction" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "type" "public"."InventoryTransactionType" NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
