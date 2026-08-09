import { FastifyInstance } from "fastify";
import {
  createStoreHandler,
  getMerchantStoresHandler,
  getStoreSetupHandler,
  updateStoreSetupHandler,
  getStoreThemeHandler,
  updateStoreThemeHandler,
  publishTemplateHandler,
  getStoreByIdOrSlugHandler,
} from "./store.controller";
import { $ref } from "./store.schema";

export async function storeRoutes(server: FastifyInstance) {
  // Get Store Theme & Active Template details (Authenticated Merchant)
  server.get(
    "/theme",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Store Management"],
        summary: "Get Store Theme Configuration",
        description: "Retrieves active theme colors, typography, layout, header, footer & template slug.",
        security: [{ bearerAuth: [] }],
        response: {
          200: $ref("storeThemeResponseSchema"),
        },
      },
    },
    getStoreThemeHandler
  );

  // Update Store Theme Configuration (Authenticated Merchant)
  server.put(
    "/theme",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Store Management"],
        summary: "Update Store Theme Configuration",
        description: "Updates theme colors, typography, layout, header, footer settings.",
        security: [{ bearerAuth: [] }],
        body: $ref("updateThemeConfigSchema"),
        response: {
          200: $ref("storeThemeResponseSchema"),
        },
      },
    },
    updateStoreThemeHandler
  );

  // Publish / Activate Template (Authenticated Merchant)
  server.post(
    "/publish-template",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Store Management"],
        summary: "Publish Store Template",
        description: "Publishes/activates a store layout template slug for the authenticated merchant.",
        security: [{ bearerAuth: [] }],
        body: $ref("publishTemplateSchema"),
        response: {
          200: $ref("storeThemeResponseSchema"),
        },
      },
    },
    publishTemplateHandler
  );

  // Get Store Setup details (Authenticated Merchant)
  server.get(
    "/setup",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Store Management"],
        summary: "Get Store Setup Details",
        description: "Retrieves complete store configuration parameters for the authenticated merchant.",
        security: [{ bearerAuth: [] }],
        response: {
          200: $ref("storeSetupResponseSchema"),
        },
      },
    },
    getStoreSetupHandler
  );

  // Update Store Setup details (Authenticated Merchant)
  server.put(
    "/setup",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Store Management"],
        summary: "Update Store Setup Details",
        description: "Updates store parameters (name, logo, favicon, description, contact info, address, social links, domain, currency, language, timezone).",
        security: [{ bearerAuth: [] }],
        body: $ref("updateStoreSetupSchema"),
        response: {
          200: $ref("storeSetupResponseSchema"),
        },
      },
    },
    updateStoreSetupHandler
  );

  // Create Store (Authenticated Merchant)
  server.post(
    "/",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Store Management"],
        summary: "Create Store",
        description: "Creates a new store linked to the authenticated merchant after validating slug uniqueness.",
        security: [{ bearerAuth: [] }],
        body: $ref("createStoreSchema"),
        response: {
          201: $ref("storeResponseSchema"),
        },
      },
    },
    createStoreHandler
  );

  // List all stores owned by authenticated merchant
  server.get(
    "/",
    {
      onRequest: [server.authenticate],
      schema: {
        tags: ["Store Management"],
        summary: "List Merchant Stores",
        description: "Retrieves all stores owned by the logged-in merchant.",
        security: [{ bearerAuth: [] }],
        response: {
          200: $ref("storesListResponseSchema"),
        },
      },
    },
    getMerchantStoresHandler
  );

  // Get single store details by ID or Slug (Public / Merchant)
  server.get(
    "/:idOrSlug",
    {
      schema: {
        tags: ["Store Management"],
        summary: "Get Store Details",
        description: "Fetches store details by store ID or unique slug handle.",
      },
    },
    getStoreByIdOrSlugHandler
  );
}

