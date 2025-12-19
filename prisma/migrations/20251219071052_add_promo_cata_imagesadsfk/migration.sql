-- AlterTable
ALTER TABLE "User" ALTER COLUMN "meta" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "PromoCatImage" (
    "name" TEXT NOT NULL,
    "preview" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoCatImage_name_key" ON "PromoCatImage"("name");
