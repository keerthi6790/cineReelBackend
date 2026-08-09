import { FastifyInstance } from "fastify";
import {
  createPageHandler,
  deletePageHandler,
  getPageBySlugHandler,
  getPagesHandler,
  updatePageHandler,
} from "./page.controller";
import { $ref } from "./page.schema";

export async function pageRoutes(server: FastifyInstance) {
  // Get all store pages (Public / Merchant)
  server.get(
    "/",
    {
      schema: {
        tags: ["Page Management"],
        summary: "List All Store Pages",
        description: "Retrieves list of all system, policy, and custom merchant pages.",
        response: {
          200: $ref("pagesListResponseSchema"),
        },
      },
    },
    getPagesHandler
  );

  // Create new page (Authenticated Merchant)
  server.post(
    "/",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Page Management"],
        summary: "Create Custom Page",
        description: "Creates a new custom landing page or policy page.",
        security: [{ bearerAuth: [] }],
        body: $ref("createPageSchema"),
        response: {
          201: $ref("pageResponseSchema"),
        },
      },
    },
    createPageHandler
  );

  // Update existing page (Authenticated Merchant)
  server.put(
    "/:id",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Page Management"],
        summary: "Update Page",
        description: "Updates existing page title, slug, content, or SEO metadata.",
        security: [{ bearerAuth: [] }],
        body: $ref("updatePageSchema"),
        response: {
          200: $ref("pageResponseSchema"),
        },
      },
    },
    updatePageHandler
  );

  // Delete page (Authenticated Merchant)
  server.delete(
    "/:id",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Page Management"],
        summary: "Delete Page",
        description: "Deletes a custom page by ID.",
        security: [{ bearerAuth: [] }],
      },
    },
    deletePageHandler
  );

  // Get single page details by slug / ID
  server.get(
    "/detail/*",
    {
      schema: {
        tags: ["Page Management"],
        summary: "Get Page Details by Slug",
        description: "Fetches page details by slug handle or ID.",
      },
    },
    getPageBySlugHandler
  );
}
