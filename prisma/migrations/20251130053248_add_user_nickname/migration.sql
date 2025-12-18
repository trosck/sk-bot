-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nickname" TEXT,
ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;
