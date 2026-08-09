import { FastifyInstance } from "fastify";
import {
  createMenuHandler,
  deleteMenuHandler,
  getMenusHandler,
  updateMenuHandler,
} from "./menu.controller";
import { $ref } from "./menu.schema";

export async function menuRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["Navigation Management"],
        summary: "Get All Menus",
        description: "Retrieves list of header, footer, and custom navigation menus.",
        response: {
          200: $ref("menusListResponseSchema"),
        },
      },
    },
    getMenusHandler
  );

  server.post(
    "/",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Navigation Management"],
        summary: "Create Menu",
        security: [{ bearerAuth: [] }],
        body: $ref("createMenuSchema"),
        response: {
          201: $ref("menuResponseSchema"),
        },
      },
    },
    createMenuHandler
  );

  server.put(
    "/:id",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Navigation Management"],
        summary: "Update Menu",
        security: [{ bearerAuth: [] }],
        body: $ref("updateMenuSchema"),
        response: {
          200: $ref("menuResponseSchema"),
        },
      },
    },
    updateMenuHandler
  );

  server.delete(
    "/:id",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Navigation Management"],
        summary: "Delete Menu",
        security: [{ bearerAuth: [] }],
      },
    },
    deleteMenuHandler
  );
}
