import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/prisma";
import { responseSender } from "../../utils/responseSender";
import { getOrCreateMovieByTmdbId } from "../movie/movie.controller";
import {
  CreatePostRequestSchema,
  GetFeedQuerySchema,
  UpdatePostRequestSchema,
} from "./post.schema";

const userSelectFields = {
  id: true,
  fullName: true,
  userName: true,
  photoUrl: true,
};

const movieSelectFields = {
  id: true,
  title: true,
  posterUrl: true,
  backdropUrl: true,
  releaseDate: true,
  averageRating: true,
};

export const createPost = async (
  request: FastifyRequest<{ Body: CreatePostRequestSchema }>,
  reply: FastifyReply,
) => {
  try {
    const userId = request.user.id;
    const { content, mediaUrl, mediaType = "TEXT", movieId, tmdbId } = request.body;

    if (!content && !mediaUrl) {
      return responseSender({
        reply,
        code: 500,
        status: false,
        message: "Post must contain text content or media",
      });
    }

    let targetMovieId = movieId;

    if (!targetMovieId && tmdbId) {
      const importedMovie = await getOrCreateMovieByTmdbId(tmdbId);
      targetMovieId = importedMovie.id;
    }

    const post = await prisma.post.create({
      data: {
        content,
        mediaUrl,
        mediaType,
        userId,
        movieId: targetMovieId,
      },
      include: {
        user: { select: userSelectFields },
        movie: { select: movieSelectFields },
      },
    });

    responseSender({
      reply,
      code: 201,
      status: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (err: any) {
    console.error("Create post error:", err);
    responseSender({
      reply,
      code: 500,
      status: false,
      message: err.message || "Failed to create post",
    });
  }
};

export const getFeed = async (
  request: FastifyRequest<{ Querystring: GetFeedQuerySchema }>,
  reply: FastifyReply,
) => {
  try {
    const { page = "1", limit = "10", mediaType } = request.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (mediaType) {
      where.mediaType = mediaType;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: userSelectFields },
          movie: { select: movieSelectFields },
        },
      }),
      prisma.post.count({ where }),
    ]);

    responseSender({
      reply,
      code: 201,
      status: true,
      data: {
        posts,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      },
    });
  } catch (err: any) {
    console.error("Get feed error:", err);
    responseSender({
      reply,
      code: 500,
      status: false,
      message: "Failed to fetch social feed",
    });
  }
};

export const getUserPosts = async (
  request: FastifyRequest<{
    Params: { userId: string };
    Querystring: GetFeedQuerySchema;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { userId } = request.params;
    const { page = "1", limit = "10" } = request.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * limitNumber;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId },
        skip,
        take: limitNumber,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: userSelectFields },
          movie: { select: movieSelectFields },
        },
      }),
      prisma.post.count({ where: { userId } }),
    ]);

    responseSender({
      reply,
      code: 201,
      status: true,
      data: {
        posts,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      },
    });
  } catch (err: any) {
    console.error("Get user posts error:", err);
    responseSender({
      reply,
      code: 500,
      status: false,
      message: "Failed to fetch user posts",
    });
  }
};

export const getPostById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: userSelectFields },
        movie: { select: movieSelectFields },
      },
    });

    if (!post) {
      return responseSender({
        reply,
        code: 500,
        status: false,
        message: "Post not found",
      });
    }

    responseSender({
      reply,
      code: 201,
      status: true,
      data: post,
    });
  } catch (err: any) {
    console.error("Get post by ID error:", err);
    responseSender({
      reply,
      code: 500,
      status: false,
      message: "Failed to fetch post",
    });
  }
};

export const updatePost = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdatePostRequestSchema;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;
    const userId = request.user.id;
    const { content, mediaUrl, mediaType, movieId } = request.body;

    const existingPost = await prisma.post.findUnique({ where: { id } });

    if (!existingPost) {
      return responseSender({
        reply,
        code: 500,
        status: false,
        message: "Post not found",
      });
    }

    if (existingPost.userId !== userId) {
      return responseSender({
        reply,
        code: 500,
        status: false,
        message: "Unauthorized to update this post",
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        content,
        mediaUrl,
        mediaType,
        movieId,
      },
      include: {
        user: { select: userSelectFields },
        movie: { select: movieSelectFields },
      },
    });

    responseSender({
      reply,
      code: 201,
      status: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (err: any) {
    console.error("Update post error:", err);
    responseSender({
      reply,
      code: 500,
      status: false,
      message: err.message || "Failed to update post",
    });
  }
};

export const deletePost = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;
    const userId = request.user.id;

    const existingPost = await prisma.post.findUnique({ where: { id } });

    if (!existingPost) {
      return responseSender({
        reply,
        code: 500,
        status: false,
        message: "Post not found",
      });
    }

    if (existingPost.userId !== userId) {
      return responseSender({
        reply,
        code: 500,
        status: false,
        message: "Unauthorized to delete this post",
      });
    }

    await prisma.post.delete({ where: { id } });

    responseSender({
      reply,
      code: 201,
      status: true,
      message: "Post deleted successfully",
    });
  } catch (err: any) {
    console.error("Delete post error:", err);
    responseSender({
      reply,
      code: 500,
      status: false,
      message: "Failed to delete post",
    });
  }
};
