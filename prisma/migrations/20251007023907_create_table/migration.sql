-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('ADMIN', 'KITCHEN', 'WAITER');

-- CreateEnum
CREATE TYPE "ProductActive" AS ENUM ('TRUE', 'FALSE');

-- CreateEnum
CREATE TYPE "TableActive" AS ENUM ('TRUE', 'FALSE');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('BUSY', 'FREE');

-- CreateEnum
CREATE TYPE "OrdersStatus" AS ENUM ('DELIVERED', 'PENDING', 'READY', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrdersWasPaid" AS ENUM ('TRUE', 'FALSE');

-- CreateEnum
CREATE TYPE "Payment" AS ENUM ('PIX', 'CARD');

-- CreateEnum
CREATE TYPE "DeleteProduct" AS ENUM ('TRUE', 'FALSE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "ROLE" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upadetedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "active" "ProductActive" NOT NULL DEFAULT 'TRUE',
    "deleted" "DeleteProduct" DEFAULT 'FALSE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upadetedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoriesId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "numberTable" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "qrcodePath" TEXT,
    "tableActive" "TableActive" NOT NULL DEFAULT 'TRUE',
    "tableStatus" "TableStatus" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upadetedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "numberOrder" SERIAL NOT NULL,
    "status" "OrdersStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL,
    "payment" "Payment",
    "wasPaid" "OrdersWasPaid" NOT NULL DEFAULT 'FALSE',
    "observations" TEXT,
    "paymentId" TEXT,
    "qrCodeText" TEXT,
    "qrImageUrl" TEXT,
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
    "ordersId" TEXT,
    "productId" TEXT,

    CONSTRAINT "OrdersItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT,
    "reference" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Table_numberTable_key" ON "Table"("numberTable");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoriesId_fkey" FOREIGN KEY ("categoriesId") REFERENCES "Categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdersItems" ADD CONSTRAINT "OrdersItems_ordersId_fkey" FOREIGN KEY ("ordersId") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdersItems" ADD CONSTRAINT "OrdersItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
