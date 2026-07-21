import fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt, { JWT } from "fastify-jwt";
import userRoutes from "./modules/user/user.route";
import { UserSchema } from "./modules/user/user.schema";
import movieRoutes from "./modules/movie/movie.route";
import { MovieSchema } from "./modules/movie/movie.schema";
import postRoutes from "./modules/post/post.route";
import { PostSchema } from "./modules/post/post.schema";
import { env } from "prisma/config";
import genreRoutes from "./modules/genre/genre.route";
import commonRoutes from "./modules/common/common.route";
import multipart from "@fastify/multipart";



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
      emailAddress: string;
    };
  }
}

function buildServer() {
  const server = fastify();

  server.setErrorHandler((err: any, req, reply) => {
    if (err.validation) {
      return reply.status(400).send({
        message: "Validation failed",
        errors: err.validation.map((e: any) => ({
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

  server.register(multipart);

  server.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (e: any) {
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

  for (const schema of [...UserSchema, ...MovieSchema, ...PostSchema]) {
    server.addSchema(schema);
  }

  server.register(userRoutes, { prefix: "/api/user" });
  server.register(genreRoutes, { prefix: "/api/genre" });
  server.register(commonRoutes, { prefix: "/api/common" });
  server.register(movieRoutes, { prefix: "/api/movie" });
  server.register(postRoutes, { prefix: "/api/post" });

  return server;
}

export default buildServer;
