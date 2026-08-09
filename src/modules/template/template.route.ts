import { FastifyInstance } from "fastify";
import {
  createTemplateHandler,
  getTemplateByIdOrSlugHandler,
  getTemplatesHandler,
} from "./template.controller";
import { $ref } from "./template.schema";

export async function templateRoutes(server: FastifyInstance) {
  // Get all store templates
  server.get(
    "/",
    {
      schema: {
        tags: ["Store Templates"],
        summary: "List Store Templates",
        description: "Retrieves list of all available store layout templates with preview image, accent colors, and features.",
        response: {
          200: $ref("templatesListResponseSchema"),
        },
      },
    },
    getTemplatesHandler
  );

  // Create Template (Admin)
  server.post(
    "/",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Store Templates"],
        summary: "Create Store Template",
        description: "Creates a new store template option.",
        security: [{ bearerAuth: [] }],
        body: $ref("createTemplateSchema"),
        response: {
          201: $ref("templateResponseSchema"),
        },
      },
    },
    createTemplateHandler
  );

  // Get Template by ID or Slug
  server.get(
    "/:idOrSlug",
    {
      schema: {
        tags: ["Store Templates"],
        summary: "Get Template Details",
        description: "Fetches single template by ID or slug.",
      },
    },
    getTemplateByIdOrSlugHandler
  );
}
