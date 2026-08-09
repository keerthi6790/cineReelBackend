import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const createPageSchema = z.object({
  title: z.string({ required_error: "Page title is required" }).min(2, "Page title must be at least 2 characters"),
  slug: z
    .string({ required_error: "Page slug is required" })
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-/]+$/, "Slug must contain valid URL characters"),
  content: z.string().default(""),
  pageType: z.string().default("CUSTOM"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.string().default("PUBLISHED"),
});

const updatePageSchema = createPageSchema.partial();

const pageResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  pageType: z.string(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  status: z.string(),
});

const pagesListResponseSchema = z.array(pageResponseSchema);

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;

export const { schemas: pageSchemas, $ref } = buildJsonSchemas(
  {
    createPageSchema,
    updatePageSchema,
    pageResponseSchema,
    pagesListResponseSchema,
  },
  { $id: "pageSchemas" }
);
