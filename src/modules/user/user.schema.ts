import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";

const userSchema = {
  emailAddress: z.string().email({ message: "Valid email is required" }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
};

const LoginRequest = z.object({
  ...userSchema,
});

const RegisterRequest = z.object({
  ...userSchema,
  loginType: z.enum(["GOOGLE", "NORMAL"], {
    required_error: "login type is required",
    message: "Login Type is Required",
  }),
  fullName: z
    .string({
      required_error: "Full name is Required",
    })
    .min(10, { message: "Mininum 10 characters is required" })
    .max(25, { message: "Maximum 25 characters" }),
  bio: z
    .string({ required_error: "Bio is Required" })
    .min(10, { message: "Mininum 10 characters" })
    .max(50, { message: "Maximum 25 characters" }),
  photoUrl: z.string({ required_error: "Photo Url is Required" }),
  userName: z.string({ required_error: "User Name is Required" }),
});

const updateUserRequest = z.object({
  fullName: z
    .string({
      required_error: "Full name is Required",
    })
    .min(10, { message: "Mininum 10 characters is required" })
    .max(25, { message: "Maximum 25 characters" }),
  bio: z
    .string({ required_error: "Bio is Required" })
    .min(10, { message: "Mininum 10 characters" })
    .max(50, { message: "Maximum 25 characters" }),
  photoUrl: z.string({ required_error: "Photo Url is Required" }),
  userName: z.string({ required_error: "User Name is Required" }),
});

const isEmailAddressValidRequest = z.object({
  emailAddress: z.string().email({ message: "Valid email is required" }),
});

const isUsernameValidRequest = z.object({
  userName: z.string({
    required_error: "Username is required",
  }),
});

export type LoginRequestSchema = z.infer<typeof LoginRequest>;
export type RegisterRequestSchema = z.infer<typeof RegisterRequest>;
export type updateUserRequestSchema = z.infer<typeof updateUserRequest>;
export type isEmailAddressValidRequestSchema = z.infer<
  typeof isEmailAddressValidRequest
>;
export type isUsernameValidRequestSchema = z.infer<
  typeof isUsernameValidRequest
>;

export const { schemas: UserSchema, $ref } = buildJsonSchemas({
  LoginRequest,
  RegisterRequest,
  updateUserRequest,
  isEmailAddressValidRequest,
  isUsernameValidRequest,
});
