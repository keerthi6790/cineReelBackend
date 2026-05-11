import { FastifyInstance } from "fastify";
import { getGenre } from "./genre.controller";

async function genreRoutes(server: FastifyInstance) {
  server.get("/getAll", {}, getGenre);
}

export default genreRoutes;
