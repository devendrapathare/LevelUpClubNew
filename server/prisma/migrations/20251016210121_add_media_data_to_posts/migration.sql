/*
  Warnings:

  - You are about to drop the column `media_urls` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "media_urls",
ADD COLUMN     "media_data" BYTEA[];
