-- CreateEnum
CREATE TYPE "public"."UnitType" AS ENUM ('KG', 'LITER', 'PIECE');

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "public"."UnitType" NOT NULL,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "availableStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reservedStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "returnedStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lowStockThreshold" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
