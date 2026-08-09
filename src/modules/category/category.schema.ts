import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const createCategorySchema = z.object({
  name: z.string({ required_error: "Category name is required" }),
  slug: z.string({ required_error: "Category slug is required" }),
  icon: z.string().optional(),
  description: z.string().optional(),
});

const categoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
});

const categoriesListResponseSchema = z.array(categoryResponseSchema);

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const { schemas: categorySchemas, $ref } = buildJsonSchemas(
  {
    createCategorySchema,
    categoryResponseSchema,
    categoriesListResponseSchema,
  },
  { $id: "categorySchemas" }
);
