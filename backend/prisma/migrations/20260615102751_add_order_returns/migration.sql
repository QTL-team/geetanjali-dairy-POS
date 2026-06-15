-- AlterTable
ALTER TABLE "public"."OrderItem" ADD COLUMN     "billedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "returnedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."OrderReturn" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "returnedQuantity" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderReturn_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."OrderReturn" ADD CONSTRAINT "OrderReturn_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderReturn" ADD CONSTRAINT "OrderReturn_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "public"."OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
