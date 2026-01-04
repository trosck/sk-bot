/*
  Warnings:

  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `role_add` to the `Level` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_del` to the `Level` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_id_fkey";

-- AlterTable
ALTER TABLE "Level" ADD COLUMN     "role_add" TEXT NOT NULL,
ADD COLUMN     "role_del" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;

-- DropTable
DROP TABLE "Role";
