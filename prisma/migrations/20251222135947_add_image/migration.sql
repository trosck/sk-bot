/*
  Warnings:

  - You are about to drop the column `media` on the `ScheduledPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ScheduledPost" DROP COLUMN "media";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "preview" BYTEA NOT NULL,
    "scheduledPostId" INTEGER,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_scheduledPostId_fkey" FOREIGN KEY ("scheduledPostId") REFERENCES "ScheduledPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
