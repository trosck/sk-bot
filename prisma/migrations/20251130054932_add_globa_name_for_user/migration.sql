-- AlterTable
ALTER TABLE "User" ADD COLUMN     "global_name" TEXT,
ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;
