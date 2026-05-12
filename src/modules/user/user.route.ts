import { FastifyInstance } from "fastify";
import { $ref } from "./user.schema";
import {
  isEmailAddressValid,
  isEmailVerified,
  isUserNameValid,
  loginHandler,
  registerHandler,
  updateUserData,
} from "./user.controller";

async function userRoutes(server: FastifyInstance) {
  server.post(
    "/login",
    {
      schema: {
        body: $ref("LoginRequest"),
      },
    },
    loginHandler,
  );

  server.post(
    "/register",
    {
      schema: {
        body: $ref("RegisterRequest"),
      },
    },
    registerHandler,
  );

  server.post(
    "/update",
    {
      schema: {
        body: $ref("updateUserRequest"),
      },
      preHandler: [server.authenticate],
    },
    updateUserData,
  );

  server.post(
    "/verify/email",
    {
      schema: {
        body: $ref("isEmailAddressValidRequest"),
      },
    },
    isEmailAddressValid,
  );

  server.post(
    "/verify/username",
    {
      schema: {
        body: $ref("isUsernameValidRequest"),
      },
    },
    isUserNameValid,
  );

  server.put(
    "/email/verify",
    {
      schema: {
        querystring: $ref("isEmailAddressValidRequest"),
      },
    },
    isEmailVerified,
  );
}

export default userRoutes;
