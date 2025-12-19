-- AlterTable
ALTER TABLE "AppConfig" ALTER COLUMN "admin_password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;
