import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";

const CreatePostRequest = z.object({
  content: z.string().optional(),
  mediaUrl: z.string().url("Invalid media URL").optional().or(z.literal("")),
  mediaType: z.enum(["TEXT", "IMAGE", "VIDEO"]).default("TEXT"),
  movieId: z.string().optional(),
  tmdbId: z.number().optional(),
});

const UpdatePostRequest = z.object({
  content: z.string().optional(),
  mediaUrl: z.string().url("Invalid media URL").optional().or(z.literal("")),
  mediaType: z.enum(["TEXT", "IMAGE", "VIDEO"]).optional(),
  movieId: z.string().optional(),
});

const GetFeedQuery = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  mediaType: z.enum(["TEXT", "IMAGE", "VIDEO"]).optional(),
});

export type CreatePostRequestSchema = z.infer<typeof CreatePostRequest>;
export type UpdatePostRequestSchema = z.infer<typeof UpdatePostRequest>;
export type GetFeedQuerySchema = z.infer<typeof GetFeedQuery>;

export const { schemas: PostSchema, $ref } = buildJsonSchemas(
  {
    CreatePostRequest,
    UpdatePostRequest,
    GetFeedQuery,
  },
  { $id: "PostSchema" },
);
