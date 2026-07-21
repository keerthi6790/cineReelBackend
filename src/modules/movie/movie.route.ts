import { FastifyInstance } from "fastify";
import { $ref } from "./movie.schema";
import {
  createMovie,
  deleteMovie,
  getMovieById,
  getMovies,
  importTmdbMovieHandler,
  searchTmdbMoviesHandler,
  updateMovie,
} from "./movie.controller";

async function movieRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        querystring: $ref("GetMoviesQuery"),
      },
    },
    getMovies,
  );

  server.get(
    "/search-tmdb",
    {
      schema: {
        querystring: $ref("SearchTmdbQuery"),
      },
    },
    searchTmdbMoviesHandler,
  );

  server.post(
    "/import-tmdb",
    {
      schema: {
        body: $ref("ImportTmdbRequest"),
      },
      preHandler: [server.authenticate],
    },
    importTmdbMovieHandler,
  );

  server.get("/:id", {}, getMovieById);

  server.post(
    "/create",
    {
      schema: {
        body: $ref("CreateMovieRequest"),
      },
      preHandler: [server.authenticate],
    },
    createMovie,
  );

  server.put(
    "/:id",
    {
      schema: {
        body: $ref("UpdateMovieRequest"),
      },
      preHandler: [server.authenticate],
    },
    updateMovie,
  );

  server.delete("/:id", { preHandler: [server.authenticate] }, deleteMovie);
}

export default movieRoutes;
