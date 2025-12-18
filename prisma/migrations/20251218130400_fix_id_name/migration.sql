/*
  Warnings:

  - You are about to drop the column `discord_user_id` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[discord_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `discord_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_discord_user_id_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "discord_user_id",
ADD COLUMN     "discord_id" TEXT NOT NULL,
ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;

-- CreateIndex
CREATE UNIQUE INDEX "User_discord_id_key" ON "User"("discord_id");
