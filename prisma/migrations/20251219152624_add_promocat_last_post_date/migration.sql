-- AlterTable
ALTER TABLE "AppConfig" ADD COLUMN     "promocats_last_posted" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;
