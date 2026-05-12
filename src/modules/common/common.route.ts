import { FastifyInstance } from "fastify";
import { deleteUploadImage, uploadImage } from "./common.controller";

async function commonRoutes(server: FastifyInstance) {
  server.post("/upload", {}, uploadImage);

  server.delete("/delete/:id", {}, deleteUploadImage);
}

export default commonRoutes;
