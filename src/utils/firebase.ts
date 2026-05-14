import admin from "firebase-admin";
import { env } from "prisma/config";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      clientEmail: env("CLIENT_EMAIL"),
      privateKey: env("PRIVATE_KEY")?.replace(/\\n/g, "\n"),
      projectId: env("PROJECT_ID"),
    }),
  });
}

export default admin;
