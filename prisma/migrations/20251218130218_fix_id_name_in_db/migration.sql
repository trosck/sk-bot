/*
  Warnings:

  - The primary key for the `Level` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `level_id` on the `Level` table. All the data in the column will be lost.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `role_id` on the `Role` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[value]` on the table `Level` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `value` to the `Level` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_level_id_fkey";

-- AlterTable
ALTER TABLE "Level" DROP CONSTRAINT "Level_pkey",
DROP COLUMN "level_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "value" INTEGER NOT NULL,
ADD CONSTRAINT "Level_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
DROP COLUMN "role_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Level_value_key" ON "Level"("value");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_id_fkey" FOREIGN KEY ("id") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
