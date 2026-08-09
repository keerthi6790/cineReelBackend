import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../utils/prisma";
import { CheckEmailInput, CreateUserInput, LoginInput, VerifyEmailInput, ResendCodeInput } from "./user.schema";

export async function checkEmailHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email } = request.body as CheckEmailInput;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return reply.status(200).send({
      available: false,
      message: "Email is already registered.",
    });
  }

  return reply.status(200).send({
    available: true,
    message: "Email is available for registration.",
  });
}

export async function registerUserHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email, name, password, firstName, lastName } = request.body as CreateUserInput;
  const userDisplayName = (firstName && lastName ? `${firstName} ${lastName}`.trim() : name) || name;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return reply.status(400).send({
      message: "User with this email already exists.",
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate 6-digit verification code
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

  const user = await prisma.user.create({
    data: {
      email,
      name: userDisplayName,
      password: hashedPassword,
      verificationToken,
      verificationTokenExp,
    },
  });

  return reply.status(201).send({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    verificationToken: user.verificationToken,
  });
}

export async function verifyEmailHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email, token } = request.body as VerifyEmailInput;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return reply.status(404).send({ message: "User not found." });
  }

  if (user.emailVerified) {
    return reply.status(200).send({
      message: "Email is already verified.",
      emailVerified: true,
    });
  }

  if (user.verificationToken !== token) {
    return reply.status(400).send({ message: "Invalid verification code." });
  }

  if (user.verificationTokenExp && user.verificationTokenExp < new Date()) {
    return reply.status(400).send({ message: "Verification code has expired." });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExp: null,
    },
  });

  return reply.status(200).send({
    message: "Email verified successfully.",
    emailVerified: true,
  });
}

export async function loginUserHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email, password } = request.body as LoginInput;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return reply.status(400).send({ message: "Email is not registered, do a registration first." });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return reply.status(401).send({ message: "Invalid email or password." });
  }

  // Check if email is verified
  if (!user.emailVerified) {
    // Generate new 6-digit OTP verification code
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExp,
      },
    });

    return reply.status(200).send({
      requiresVerification: true,
      email: user.email,
      verificationToken,
      message: "Email is not verified. A 6-digit verification code has been sent to your email.",
    });
  }

  const jwtSecret = process.env.JWT_SECRET || "supersecretkey_change_me_in_production";
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: "7d" }
  );

  return reply.status(200).send({
    requiresVerification: false,
    accessToken,
  });
}

export async function getMeHandler(request: FastifyRequest, reply: FastifyReply) {
  const currentUser = request.user;

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      stores: {
        select: {
          id: true,
          name: true,
          slug: true,
          currency: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    return reply.status(404).send({ message: "User profile not found." });
  }

  return reply.status(200).send(user);
}

export async function resendCodeHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email } = request.body as ResendCodeInput;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return reply.status(404).send({ message: "User account not found." });
  }

  if (user.emailVerified) {
    return reply.status(200).send({
      message: "Email is already verified.",
      email: user.email,
      verificationToken: null,
    });
  }

  // Generate new 6-digit OTP verification code
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken,
      verificationTokenExp,
    },
  });

  return reply.status(200).send({
    message: "A new verification code has been generated successfully.",
    email: user.email,
    verificationToken,
  });
}
