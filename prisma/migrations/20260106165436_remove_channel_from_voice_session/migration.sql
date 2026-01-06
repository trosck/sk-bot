/*
  Warnings:

  - You are about to drop the column `channel_id` on the `VoiceSession` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "VoiceSession_channel_id_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "VoiceSession" DROP COLUMN "channel_id";
