import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";

const CreateMovieRequest = z.object({
  tmdbId: z.number().optional(),
  title: z.string({ required_error: "Title is required" }),
  originalTitle: z.string().optional(),
  overview: z.string().optional(),
  posterUrl: z.string().url("Invalid poster URL").optional().or(z.literal("")),
  backdropUrl: z.string().url("Invalid backdrop URL").optional().or(z.literal("")),
  releaseDate: z.string().optional(),
  runtime: z.number().int().positive().optional(),
  genreIds: z.array(z.string()).optional(),
});

const UpdateMovieRequest = z.object({
  tmdbId: z.number().optional(),
  title: z.string().optional(),
  originalTitle: z.string().optional(),
  overview: z.string().optional(),
  posterUrl: z.string().url("Invalid poster URL").optional().or(z.literal("")),
  backdropUrl: z.string().url("Invalid backdrop URL").optional().or(z.literal("")),
  releaseDate: z.string().optional(),
  runtime: z.number().int().positive().optional(),
  genreIds: z.array(z.string()).optional(),
});

const GetMoviesQuery = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  q: z.string().optional(),
  genreId: z.string().optional(),
});

const SearchTmdbQuery = z.object({
  query: z.string({ required_error: "Search query is required" }),
  page: z.string().optional(),
});

const ImportTmdbRequest = z.object({
  tmdbId: z.number({ required_error: "tmdbId is required" }),
});

export type CreateMovieRequestSchema = z.infer<typeof CreateMovieRequest>;
export type UpdateMovieRequestSchema = z.infer<typeof UpdateMovieRequest>;
export type GetMoviesQuerySchema = z.infer<typeof GetMoviesQuery>;
export type SearchTmdbQuerySchema = z.infer<typeof SearchTmdbQuery>;
export type ImportTmdbRequestSchema = z.infer<typeof ImportTmdbRequest>;

export const { schemas: MovieSchema, $ref } = buildJsonSchemas(
  {
    CreateMovieRequest,
    UpdateMovieRequest,
    GetMoviesQuery,
    SearchTmdbQuery,
    ImportTmdbRequest,
  },
  { $id: "MovieSchema" },
);
