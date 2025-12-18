-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT NOT NULL DEFAULT 'https://cdn.discordapp.com/embed/avatars/1.png',
ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;
