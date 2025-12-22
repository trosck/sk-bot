/*
  Warnings:

  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_scheduledPostId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;

-- DropTable
DROP TABLE "Image";

-- CreateTable
CREATE TABLE "ScheduledPostImage" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "preview" BYTEA NOT NULL,
    "scheduledPostId" INTEGER,

    CONSTRAINT "ScheduledPostImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScheduledPostImage" ADD CONSTRAINT "ScheduledPostImage_scheduledPostId_fkey" FOREIGN KEY ("scheduledPostId") REFERENCES "ScheduledPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
