-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "PromoCat" (
    "id" SERIAL NOT NULL,
    "promocode" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCat_pkey" PRIMARY KEY ("id")
);
