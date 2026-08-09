import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const checkEmailSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
});

const checkEmailResponseSchema = z.object({
  available: z.boolean(),
  message: z.string(),
});

const verifyEmailSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  token: z.string({ required_error: "Verification token is required" }),
});

const verifyEmailResponseSchema = z.object({
  message: z.string(),
  emailVerified: z.boolean(),
});

const createUserSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  name: z.string({ required_error: "Name is required" }).min(2, "Name must be at least 2 characters"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character"),
  firstName: z.string().min(4, "First name must be greater than 3 characters").optional(),
  lastName: z.string().min(1, "Last name must be at least 1 character").optional(),
  mobileNumber: z
    .string()
    .regex(/^(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}$/, "Invalid mobile phone format")
    .optional(),
});

const createUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string(),
  emailVerified: z.boolean(),
  verificationToken: z.string().nullable().optional(),
});

const loginSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  password: z.string({ required_error: "Password is required" }),
});

const loginResponseSchema = z.object({
  requiresVerification: z.boolean().optional(),
  accessToken: z.string().optional(),
  email: z.string().optional(),
  verificationToken: z.string().nullable().optional(),
  message: z.string().optional(),
});

const resendCodeSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
});

const resendCodeResponseSchema = z.object({
  message: z.string(),
  email: z.string(),
  verificationToken: z.string().nullable().optional(),
});

export type CheckEmailInput = z.infer<typeof checkEmailSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResendCodeInput = z.infer<typeof resendCodeSchema>;

export const { schemas: userSchemas, $ref } = buildJsonSchemas(
  {
    checkEmailSchema,
    checkEmailResponseSchema,
    verifyEmailSchema,
    verifyEmailResponseSchema,
    createUserSchema,
    createUserResponseSchema,
    loginSchema,
    loginResponseSchema,
    resendCodeSchema,
    resendCodeResponseSchema,
  },
  { $id: "userSchemas" }
);
