import { FastifyInstance } from "fastify";
import {
  checkEmailHandler,
  getMeHandler,
  loginUserHandler,
  registerUserHandler,
  verifyEmailHandler,
  resendCodeHandler,
} from "./user.controller";
import { $ref } from "./user.schema";

export async function userRoutes(server: FastifyInstance) {
  // Check if email is available
  server.post(
    "/check-email",
    {
      schema: {
        tags: ["User Auth & Email"],
        summary: "Check Email Availability",
        description: "Validates format and checks if an email address is available for registration.",
        body: $ref("checkEmailSchema"),
        response: {
          200: $ref("checkEmailResponseSchema"),
        },
      },
    },
    checkEmailHandler
  );

  // Register user account
  server.post(
    "/register",
    {
      schema: {
        tags: ["User Auth & Email"],
        summary: "Register User Account",
        description: "Creates a new merchant account with hashed password and generates an email verification code.",
        body: $ref("createUserSchema"),
        response: {
          201: $ref("createUserResponseSchema"),
        },
      },
    },
    registerUserHandler
  );

  // Verify email code
  server.post(
    "/verify-email",
    {
      schema: {
        tags: ["User Auth & Email"],
        summary: "Verify Email Code",
        description: "Verifies user email using the 6-digit OTP / verification token.",
        body: $ref("verifyEmailSchema"),
        response: {
          200: $ref("verifyEmailResponseSchema"),
        },
      },
    },
    verifyEmailHandler
  );

  // Resend verification code
  server.post(
    "/resend-code",
    {
      schema: {
        tags: ["User Auth & Email"],
        summary: "Resend Email Verification Code",
        description: "Generates and returns a fresh 6-digit OTP verification code for unverified emails.",
        body: $ref("resendCodeSchema"),
        response: {
          200: $ref("resendCodeResponseSchema"),
        },
      },
    },
    resendCodeHandler
  );

  // Login user account
  server.post(
    "/login",
    {
      schema: {
        tags: ["User Auth & Email"],
        summary: "User Login",
        description: "Authenticates user credentials and issues a JWT access token.",
        body: $ref("loginSchema"),
        response: {
          200: $ref("loginResponseSchema"),
        },
      },
    },
    loginUserHandler
  );

  // Get logged in profile (Requires Authentication)
  server.get(
    "/me",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["User Auth & Email"],
        summary: "Get Current User Profile",
        description: "Retrieves profile details and owned stores of the currently authenticated merchant.",
        security: [{ bearerAuth: [] }],
      },
    },
    getMeHandler
  );
}
