-- CreateEnum
CREATE TYPE "ScheduledPostStatus" AS ENUM ('SCHEDULED', 'PROCESSING', 'SENT', 'CANCELLED', 'FAILED');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "ScheduledPost" (
    "id" SERIAL NOT NULL,
    "channel_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "media" TEXT[],
    "status" "ScheduledPostStatus" NOT NULL DEFAULT 'SCHEDULED',
    "error" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledPost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScheduledPost" ADD CONSTRAINT "ScheduledPost_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
