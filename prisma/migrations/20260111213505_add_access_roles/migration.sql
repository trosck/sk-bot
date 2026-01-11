-- AlterTable
ALTER TABLE "AppConfig" ADD COLUMN     "access_roles" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;
