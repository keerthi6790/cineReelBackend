import { FastifyInstance } from "fastify";
import {
  createCategoryHandler,
  getCategoriesHandler,
} from "./category.controller";
import { $ref } from "./category.schema";

export async function categoryRoutes(server: FastifyInstance) {
  // Get all store industries & categories
  server.get(
    "/",
    {
      schema: {
        tags: ["Store Categories & Industries"],
        summary: "List Store Industries",
        description: "Retrieves list of all store industry categories with icons and descriptions.",
        response: {
          200: $ref("categoriesListResponseSchema"),
        },
      },
    },
    getCategoriesHandler
  );

  // Create Category (Admin)
  server.post(
    "/",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Store Categories & Industries"],
        summary: "Create Store Category",
        description: "Creates a new store industry option.",
        security: [{ bearerAuth: [] }],
        body: $ref("createCategorySchema"),
        response: {
          201: $ref("categoryResponseSchema"),
        },
      },
    },
    createCategoryHandler
  );
}
