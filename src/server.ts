import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fjwt from "fastify-jwt";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { withRefResolver } from "fastify-zod";
import { userSchemas } from "./modules/user/user.schema";
import { storeSchemas } from "./modules/store/store.schema";
import { templateSchemas } from "./modules/template/template.schema";
import { categorySchemas } from "./modules/category/category.schema";
import { pageSchemas } from "./modules/page/page.schema";
import { menuSchemas } from "./modules/menu/menu.schema";
import { userRoutes } from "./modules/user/user.route";
import { storeRoutes } from "./modules/store/store.route";
import { templateRoutes } from "./modules/template/template.route";
import { categoryRoutes } from "./modules/category/category.route";
import { pageRoutes } from "./modules/page/page.route";
import { menuRoutes } from "./modules/menu/menu.route";

function buildServer() {
  const server = Fastify({
    logger: true,
  });

  // CORS hook for cross-origin requests from frontend
  server.addHook("onRequest", async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (request.method === "OPTIONS") {
      return reply.status(200).send();
    }
  });

  // Register JWT plugin
  server.register(fjwt, {
    secret: process.env.JWT_SECRET || "supersecretkey_change_me_in_production",
  });

  // Add authentication decorator
  server.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ message: "Unauthorized. Valid token required." });
      }
    }
  );

  // Register Zod schemas
  for (const schema of [...userSchemas, ...storeSchemas, ...templateSchemas, ...categorySchemas, ...pageSchemas, ...menuSchemas]) {
    server.addSchema(schema);
  }

  // Register Swagger Documentation plugin
  server.register(
    fastifySwagger,
    withRefResolver({
      openapi: {
        info: {
          title: "Shopify Alternative Platform API",
          description: "Interactive API Documentation for User Auth, Email Validation, and Multi-Tenant Store Management.",
          version: "1.0.0",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description: "Enter your Bearer JWT token in format: Bearer <token>",
            },
          },
        },
      },
    })
  );

  // Register Swagger UI at /docs
  server.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
  });

  // Healthcheck route
  server.get("/healthcheck", async () => {
    return { status: "OK", timestamp: new Date().toISOString() };
  });

  // Register Module Routes
  server.register(userRoutes, { prefix: "api/users" });
  server.register(storeRoutes, { prefix: "api/stores" });
  server.register(templateRoutes, { prefix: "api/templates" });
  server.register(categoryRoutes, { prefix: "api/categories" });
  server.register(pageRoutes, { prefix: "api/pages" });
  server.register(menuRoutes, { prefix: "api/menus" });

  return server;
}

export default buildServer;
