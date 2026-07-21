import { FastifyInstance } from "fastify";
import { $ref } from "./post.schema";
import {
  createPost,
  deletePost,
  getFeed,
  getPostById,
  getUserPosts,
  updatePost,
} from "./post.controller";

async function postRoutes(server: FastifyInstance) {
  server.get(
    "/feed",
    {
      schema: {
        querystring: $ref("GetFeedQuery"),
      },
    },
    getFeed,
  );

  server.get(
    "/user/:userId",
    {
      schema: {
        querystring: $ref("GetFeedQuery"),
      },
    },
    getUserPosts,
  );

  server.get("/:id", {}, getPostById);

  server.post(
    "/create",
    {
      schema: {
        body: $ref("CreatePostRequest"),
      },
      preHandler: [server.authenticate],
    },
    createPost,
  );

  server.put(
    "/:id",
    {
      schema: {
        body: $ref("UpdatePostRequest"),
      },
      preHandler: [server.authenticate],
    },
    updatePost,
  );

  server.delete("/:id", { preHandler: [server.authenticate] }, deletePost);
}

export default postRoutes;
