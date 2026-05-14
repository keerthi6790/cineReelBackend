/*
  Warnings:

  - You are about to drop the column `emailAddress` on the `userOtp` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `userOtp` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `userOtp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "userOtp" DROP COLUMN "emailAddress",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "userOtp_userId_key" ON "userOtp"("userId");

-- AddForeignKey
ALTER TABLE "userOtp" ADD CONSTRAINT "userOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
