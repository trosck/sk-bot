/*
  Warnings:

  - Added the required column `admin_password` to the `AppConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppConfig" ADD COLUMN     "admin_password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;
