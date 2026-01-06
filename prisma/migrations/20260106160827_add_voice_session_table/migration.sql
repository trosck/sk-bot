-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "VoiceSession" (
    "user_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceSession_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoiceSession_user_id_key" ON "VoiceSession"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceSession_channel_id_key" ON "VoiceSession"("channel_id");
