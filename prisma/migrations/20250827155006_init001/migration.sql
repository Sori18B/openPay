/*
  Warnings:

  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Transaction";

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" TEXT NOT NULL,
    "openpayId" TEXT NOT NULL,
    "source_id" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "description" TEXT NOT NULL,
    "order_id" TEXT,
    "device_session_id" TEXT,
    "status" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "clabe" TEXT,
    "dueDate" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" INTEGER NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_id_key" ON "public"."transactions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_openpayId_key" ON "public"."transactions"("openpayId");

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
