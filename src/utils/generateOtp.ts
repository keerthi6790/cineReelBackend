import crypto from "crypto";

const generateOtp = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
  const bytes = crypto.randomBytes(length);

  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

export default generateOtp;
