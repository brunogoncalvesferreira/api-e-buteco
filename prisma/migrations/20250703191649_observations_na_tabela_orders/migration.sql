/*
  Warnings:

  - You are about to drop the column `observations` on the `OrdersItems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "observations" TEXT;

-- AlterTable
ALTER TABLE "OrdersItems" DROP COLUMN "observations";
