/*
  Warnings:

  - The values [PROCESSING] on the enum `ScheduledPostStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ScheduledPostStatus_new" AS ENUM ('SCHEDULED', 'SENT', 'CANCELLED', 'FAILED');
ALTER TABLE "public"."ScheduledPost" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ScheduledPost" ALTER COLUMN "status" TYPE "ScheduledPostStatus_new" USING ("status"::text::"ScheduledPostStatus_new");
ALTER TYPE "ScheduledPostStatus" RENAME TO "ScheduledPostStatus_old";
ALTER TYPE "ScheduledPostStatus_new" RENAME TO "ScheduledPostStatus";
DROP TYPE "public"."ScheduledPostStatus_old";
ALTER TABLE "ScheduledPost" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;
