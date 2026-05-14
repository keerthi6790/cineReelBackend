-- CreateTable
CREATE TABLE "userOtp" (
    "id" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "otp" TEXT NOT NULL,

    CONSTRAINT "userOtp_pkey" PRIMARY KEY ("id")
);
