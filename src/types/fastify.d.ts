import { JWT } from "fastify-jwt";

declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module "fastify-jwt" {
  interface FastifyJWT {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}
