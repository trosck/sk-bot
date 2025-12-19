-- CreateEnum
CREATE TYPE "ScheduledPostStatus" AS ENUM ('SCHEDULED', 'PROCESSING', 'SENT', 'CANCELLED', 'FAILED');

-- CreateTable
CREATE TABLE "AppConfig" (
    "guild_id" TEXT NOT NULL,
    "promocats_channel_id" TEXT,
    "promocats_post_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "discord_id" TEXT NOT NULL,
    "avatar" TEXT,
    "username" TEXT,
    "nickname" TEXT,
    "global_name" TEXT,
    "roles" TEXT[],
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "cookies" INTEGER NOT NULL DEFAULT 0,
    "voice_chat" INTEGER NOT NULL DEFAULT 0,
    "banned_at" TIMESTAMP(3),
    "notes" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level_id" INTEGER,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledPost" (
    "id" SERIAL NOT NULL,
    "channel_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "media" TEXT[],
    "status" "ScheduledPostStatus" NOT NULL DEFAULT 'SCHEDULED',
    "error" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCat" (
    "id" SERIAL NOT NULL,
    "promocode" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCatImage" (
    "name" TEXT NOT NULL,
    "preview" BYTEA NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discord_id_key" ON "User"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "Level_value_key" ON "Level"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_id_key" ON "Channel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCat_date_key" ON "PromoCat"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCatImage_name_key" ON "PromoCatImage"("name");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_id_fkey" FOREIGN KEY ("id") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPost" ADD CONSTRAINT "ScheduledPost_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
