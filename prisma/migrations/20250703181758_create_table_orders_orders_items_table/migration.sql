-- CreateEnum
CREATE TYPE "TableActive" AS ENUM ('TRUE', 'FALSE');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('BUSY', 'FREE');

-- CreateEnum
CREATE TYPE "OrdersStatus" AS ENUM ('DELIVERED', 'PENDING', 'READY', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrdersWasPaid" AS ENUM ('TRUE', 'FALSE');

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "numberTable" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "qrcodePath" TEXT NOT NULL,
    "tableActive" "TableActive" NOT NULL DEFAULT 'TRUE',
    "tableStatus" "TableStatus" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upadetedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "status" "OrdersStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL,
    "payment" TEXT NOT NULL,
    "wasPaid" "OrdersWasPaid" NOT NULL DEFAULT 'FALSE',
    "tableId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdersItems" (
    "id" TEXT NOT NULL,
    "priceUnitProduct" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "observations" TEXT,
    "ordersId" TEXT,
    "productId" TEXT,

    CONSTRAINT "OrdersItems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdersItems" ADD CONSTRAINT "OrdersItems_ordersId_fkey" FOREIGN KEY ("ordersId") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdersItems" ADD CONSTRAINT "OrdersItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
