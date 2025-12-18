-- AlterEnum
ALTER TYPE "ScheduledPostStatus" ADD VALUE 'PROCESSING';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;
