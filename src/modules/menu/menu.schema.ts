import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const createMenuSchema = z.object({
  title: z.string({ required_error: "Menu title is required" }),
  handle: z.string({ required_error: "Menu handle is required" }),
  location: z.string().default("HEADER"),
  itemsJson: z.string().optional(),
});

const updateMenuSchema = createMenuSchema.partial();

const menuResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  location: z.string(),
  itemsJson: z.string().nullable().optional(),
});

const menusListResponseSchema = z.array(menuResponseSchema);

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;

export const { schemas: menuSchemas, $ref } = buildJsonSchemas(
  {
    createMenuSchema,
    updateMenuSchema,
    menuResponseSchema,
    menusListResponseSchema,
  },
  { $id: "menuSchemas" }
);
