import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const createTemplateSchema = z.object({
  slug: z.string({ required_error: "Slug is required" }),
  name: z.string({ required_error: "Template name is required" }),
  tagline: z.string().optional(),
  description: z.string().optional(),
  previewImage: z.string().optional(),
  accentColor: z.string().default("#3B82F6"),
  badge: z.string().optional(),
  features: z.string().optional(),
});

const templateResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  previewImage: z.string().nullable().optional(),
  accentColor: z.string(),
  badge: z.string().nullable().optional(),
  features: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
});

const templatesListResponseSchema = z.array(templateResponseSchema);

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

export const { schemas: templateSchemas, $ref } = buildJsonSchemas(
  {
    createTemplateSchema,
    templateResponseSchema,
    templatesListResponseSchema,
  },
  { $id: "templateSchemas" }
);
