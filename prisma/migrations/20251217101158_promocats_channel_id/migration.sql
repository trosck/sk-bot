-- AlterTable
ALTER TABLE "AppConfig" ADD COLUMN     "promocats_channel_id" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;
