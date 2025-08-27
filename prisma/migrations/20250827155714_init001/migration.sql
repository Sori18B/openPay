/*
  Warnings:

  - The primary key for the `transactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "public"."transactions_id_key";

-- AlterTable
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");
