import fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt, { JWT } from "fastify-jwt";
import userRoutes from "./modules/user/user.route";
import { UserSchema } from "./modules/user/user.schema";
import { env } from "prisma/config";

declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
  }

  export interface FastifyInstance {
    authenticate: any;
  }
}

declare module "fastify-jwt" {
  interface FastifyJWT {
    user: {
      id: string;
      email: string;
    };
  }
}

function buildServer() {
  const server = fastify();

  server.setErrorHandler((err, req, reply) => {
    console.log({ err: err.validation });
    if (err.validation) {
      return reply.status(400).send({
        message: "Validation failed",
        errors: err.validation.map((e) => ({
          field: e.instancePath,
          message: e.message,
        })),
      });
    }

    reply.send(err);
  });

  server.get("/health-check", (request: FastifyRequest, reply: FastifyReply) =>
    reply.code(201).send("Running"),
  );

  server.register(fastifyJwt, {
    secret: env("SECRET_KEY"),
  });

  server.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (e) {
        reply.code(500).send(e);
      }
    },
  );

  server.addHook(
    "preHandler",
    (request: FastifyRequest, reply: FastifyReply, next) => {
      request.jwt = server.jwt;
      return next();
    },
  );

  for (const schema of [...UserSchema]) {
    server.addSchema(schema);
  }

  server.register(userRoutes, { prefix: "/api/user" });

  return server;
}

export default buildServer;
