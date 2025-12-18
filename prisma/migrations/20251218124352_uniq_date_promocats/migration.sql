/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `PromoCat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;

-- CreateIndex
CREATE UNIQUE INDEX "PromoCat_date_key" ON "PromoCat"("date");
