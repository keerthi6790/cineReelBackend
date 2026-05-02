-- CreateEnum
CREATE TYPE "LoginType" AS ENUM ('GOOGLE', 'NORMAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT,
    "userName" TEXT,
    "bio" TEXT,
    "emailAdress" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "loginType" "LoginType" NOT NULL DEFAULT 'NORMAL',
    "photoUrl" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserGenres" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserGenres_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailAdress_key" ON "User"("emailAdress");

-- CreateIndex
CREATE INDEX "_UserGenres_B_index" ON "_UserGenres"("B");

-- AddForeignKey
ALTER TABLE "_UserGenres" ADD CONSTRAINT "_UserGenres_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserGenres" ADD CONSTRAINT "_UserGenres_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
