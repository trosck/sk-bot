/*
  Warnings:

  - The `media` column on the `ScheduledPost` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ScheduledPost" DROP COLUMN "media",
ADD COLUMN     "media" JSONB[];

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;
