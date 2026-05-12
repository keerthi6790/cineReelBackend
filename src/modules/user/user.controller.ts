import fastify, { FastifyReply, FastifyRequest } from "fastify";
import {
  isEmailAddressValidRequestSchema,
  isUsernameValidRequestSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
  updateUserRequestSchema,
} from "./user.schema";
import { responseSender } from "../../utils/responseSender";
import prisma from "../../utils/prisma";
import bcrypt from "bcrypt";
import { Prisma } from "../../generated/prisma/client";
import jwt from "jsonwebtoken";
import { env } from "prisma/config";

export const loginHandler = async (
  request: FastifyRequest<{ Body: LoginRequestSchema }>,
  reply: FastifyReply,
) => {
  try {
    const { emailAddress, password } = request.body;

    const foundedUser = await prisma.user.findUniqueOrThrow({
      where: {
        emailAdress: emailAddress,
      },
    });

    console.log({ foundedUser });

    if (foundedUser) {
      const isPasswordMatched = await bcrypt.compare(
        password,
        foundedUser.hashed_password,
      );

      if (isPasswordMatched) {
        const jwtToken = jwt.sign(
          {
            id: foundedUser.id,
            emailAddress: foundedUser.emailAdress,
          },
          env("SECRET_KEY"),
        );

        responseSender({
          reply,
          code: 201,
          message: "LoggedIn Successfully",
          status: true,
          data: {
            token: jwtToken,
          },
        });
      } else {
        responseSender({
          reply,
          code: 500,
          message: "Email/ Password mismatched",
          status: false,
        });
      }
    } else {
      responseSender({
        reply,
        code: 500,
        message: "Email/ Password mismatched",
        status: false,
      });
    }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (err.code === "P2025") {
        responseSender({
          reply,
          code: 500,
          message: "Email/ Password mismatched",
          status: false,
        });
      }
    }
    responseSender({
      reply,
      code: 500,
      message: "Something went wrong!",
      status: false,
      data: err,
    });
  }
};

export const registerHandler = async (
  request: FastifyRequest<{ Body: RegisterRequestSchema }>,
  reply: FastifyReply,
) => {
  try {
    const {
      emailAddress,
      password,
      loginType,
      bio,
      fullName,
      photoData,
      userName,
    } = request.body;

    const hashed_password = await bcrypt.hash(password, 12);

    if (hashed_password) {
      const createdUser = await prisma.user.create({
        data: {
          emailAdress: emailAddress,
          hashed_password: hashed_password,
          loginType: loginType,
          bio,
          fullName,
          photoUrl: photoData,
          userName,
        },
      });

      if (createdUser) {
        const jwtToken = jwt.sign(
          {
            id: createdUser.id,
            emailAddress: createdUser.emailAdress,
          },
          env("SECRET_KEY"),
        );

        responseSender({
          reply,
          code: 201,
          message: "Registered Successfully",
          status: true,
          data: {
            token: jwtToken,
          },
        });
      } else {
        responseSender({
          reply,
          code: 500,
          message: "Something went wrong!",
          status: false,
        });
      }
    } else {
      responseSender({
        reply,
        code: 500,
        message: "Something went wrong while hashing!",
        status: false,
      });
    }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      console.log({ err });
      // The .code property can be accessed in a type-safe manner
      if (err.code === "P2002") {
        responseSender({
          reply,
          code: 500,
          message: "Already email is registered!",
          status: false,
        });
      }
    }

    responseSender({
      reply,
      code: 500,
      message: "Something went wrong!",
      status: false,
      data: err,
    });
  }
};

export const updateUserData = async (
  request: FastifyRequest<{ Body: updateUserRequestSchema }>,
  reply: FastifyReply,
) => {
  try {
    const { bio, fullName, photoUrl, userName } = request.body;

    const user = request.user.id;

    const updatedUserData = await prisma.user.update({
      where: {
        id: user,
      },
      data: {
        bio,
        fullName,
        photoUrl,
        userName,
      },
    });

    if (updatedUserData) {
      responseSender({
        reply,
        code: 201,
        message: "Updated Successfully",
        status: true,
      });
    }
  } catch (err) {
    responseSender({
      reply,
      code: 500,
      message: "Something went wrong!",
      status: false,
      data: err,
    });
  }
};

export const isEmailAddressValid = async (
  request: FastifyRequest<{ Body: isEmailAddressValidRequestSchema }>,
  reply: FastifyReply,
) => {
  try {
    const { emailAddress } = request.body;
    const userData = await prisma.user.findUnique({
      where: {
        emailAdress: emailAddress,
      },
    });

    if (userData) {
      responseSender({
        reply,
        code: 500,
        message: "Already EmailId is Registered",
        status: false,
      });
    } else {
      responseSender({
        reply,
        code: 201,
        status: true,
      });
    }
  } catch (err) {
    responseSender({
      reply,
      code: 500,
      message: "Something went wrong!",
      status: false,
      data: err,
    });
  }
};

export const isUserNameValid = async (
  request: FastifyRequest<{ Body: isUsernameValidRequestSchema }>,
  reply: FastifyReply,
) => {
  try {
    const { userName } = request.body;
    const userData = await prisma.user.findUnique({
      where: {
        userName,
      },
    });

    if (userData) {
      responseSender({
        reply,
        code: 500,
        message: "Already Username is Used",
        status: false,
      });
    } else {
      responseSender({
        reply,
        code: 201,
        status: true,
      });
    }
  } catch (err) {
    responseSender({
      reply,
      code: 500,
      message: "Something went wrong!",
      status: false,
      data: err,
    });
  }
};
