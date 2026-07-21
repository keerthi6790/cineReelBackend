import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/prisma";
import { responseSender } from "../../utils/responseSender";
import {
  fetchTmdbMovieDetails,
  formatTmdbImageUrl,
  searchTmdbMovies,
} from "../../utils/tmdb";
import {
  CreateMovieRequestSchema,
  GetMoviesQuerySchema,
  ImportTmdbRequestSchema,
  SearchTmdbQuerySchema,
  UpdateMovieRequestSchema,
} from "./movie.schema";

/**
 * Utility helper: Get local movie by TMDB ID or auto-import from TMDB API
 */
export async function getOrCreateMovieByTmdbId(tmdbId: number) {
  const existingMovie = await prisma.movie.findUnique({
    where: { tmdbId },
    include: { genres: true },
  });

  if (existingMovie) {
    return existingMovie;
  }

  const tmdbDetails = await fetchTmdbMovieDetails(tmdbId);

  // Match or create genres in local DB
  const genreConnectIds: { id: string }[] = [];
  if (tmdbDetails.genres && tmdbDetails.genres.length > 0) {
    for (const g of tmdbDetails.genres) {
      let localGenre = await prisma.genre.findFirst({
        where: { name: { equals: g.name, mode: "insensitive" } },
      });

      if (!localGenre) {
        localGenre = await prisma.genre.create({
          data: {
            name: g.name,
            imageUrl: "",
          },
        });
      }
      genreConnectIds.push({ id: localGenre.id });
    }
  }

  const newMovie = await prisma.movie.create({
    data: {
      tmdbId: tmdbDetails.id,
      title: tmdbDetails.title,
      originalTitle: tmdbDetails.original_title,
      overview: tmdbDetails.overview,
      posterUrl: formatTmdbImageUrl(tmdbDetails.poster_path, "poster"),
      backdropUrl: formatTmdbImageUrl(tmdbDetails.backdrop_path, "backdrop"),
      releaseDate: tmdbDetails.release_date
        ? new Date(tmdbDetails.release_date)
        : undefined,
      runtime: tmdbDetails.runtime,
      averageRating: tmdbDetails.vote_average || 0,
      voteCount: tmdbDetails.vote_count || 0,
      genres: genreConnectIds.length
        ? { connect: genreConnectIds }
        : undefined,
    },
    include: {
      genres: true,
    },
  });

  return newMovie;
}

export const createMovie = async (
  request: FastifyRequest<{ Body: CreateMovieRequestSchema }>,
  reply: FastifyReply,
) => {
  try {
    const {
      tmdbId,
      title,
      originalTitle,
      overview,
      posterUrl,
      backdropUrl,
      releaseDate,
      runtime,
      genreIds,
    } = request.body;

    const movie = await prisma.movie.create({
      data: {
        tmdbId,
        title,
        originalTitle,
        overview,
        posterUrl,
        backdropUrl,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        runtime,
        genres: genreIds?.length
          ? {
              connect: genreIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        genres: true,
      },
    });

    responseSender({
      reply,
      code: 201,
      status: true,
      message: "Movie created successfully",
      data: movie,
    });
  } catch (err: any) {
    console.error("Create movie error:", err);
    responseSender({
      reply,
      code: 500,
      status: false,
      message: err.message || "Failed to create movie",
    });
  }
};

export const getMovies = async (
  request: FastifyRequest<{ Querystring: GetMoviesQuerySchema }>,
  reply: FastifyReply,
) => {
  try {
    const { page = "1", limit = "10", q, genreId } = request.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};

    if (q) {
      where.title = {
        contains: q,
        mode: "insensitive",
      };
    }

    if (genreId) {
      where.genres = {
        some: {
          id: genreId,
        },
      };
    }

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: "desc" },
        include: {
          genres: true,
        },
      }),
      prisma.movie.count({ where }),
    ]);

    responseSender({
      reply,
      code: 201,
      status: true,
      data: {
        movies,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      },
    });
  } catch (err: any) {
    console.error("Get movies error:", err);
    responseSender({
      reply,
      code: 500,
      status: false,
      message: "Failed to fetch movies",
    });
  }
};

export const getMovieById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        genres: true,
      },
    });

    if (!movie) {
      return responseSender({
        reply,
        code: 500,
        status: false,
        message: "Movie not found",
      });
    }

    responseSender({
      reply,
      code: 201,
      status: true,
      data: movie,
    });
  } catch (err: any) {
    console.error("Get movie by ID error:", err);
    responseSender({
      reply,
      code: 500,
      status: false,
      message: "Failed to fetch movie details",
    });
  }
};

export const updateMovie = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateMovieRequestSchema;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;
    const {
      tmdbId,
      title,
      originalTitle,
      overview,
      posterUrl,
      backdropUrl,
      releaseDate,
      runtime,
      genreIds,
    } = request.body;

    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: {
        tmdbId,
        title,
        originalTitle,
        overview,
        posterUrl,
        backdropUrl,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        runtime,
        genres: genreIds
          ? {
              set: genreIds.map((gId) => ({ id: gId })),
            }
          : undefined,
      },
      include: {
        genres: true,
      },
    });

    responseSender({
      reply,
      code: 201,
      status: true,
      message: "Movie updated successfully",
      data: updatedMovie,
    });
  } catch (err: any) {
    console.error("Update movie error:", err);
    responseSender({
      reply,
      code: 500,
      status: false,
      message: err.message || "Failed to update movie",
    });
  }
};

export const deleteMovie = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;

    await prisma.movie.delete({
      where: { id },
    });

    responseSender({
      reply,
      code: 201,
      status: true,
      message: "Movie deleted successfully",
    });
  } catch (err: any) {
    console.error("Delete movie error:", err);
    responseSender({
      reply,
      code: 500,
      status: false,
      message: "Failed to delete movie",
    });
  }
};

export const searchTmdbMoviesHandler = async (
  request: FastifyRequest<{ Querystring: SearchTmdbQuerySchema }>,
  reply: FastifyReply,
) => {
  try {
    const { query, page } = request.query;
    const results = await searchTmdbMovies(query, page ? parseInt(page, 10) : 1);

    responseSender({
      reply,
      code: 201,
      status: true,
      data: results,
    });
  } catch (err: any) {
    console.error("TMDB search error:", err);
    responseSender({
      reply,
      code: 500,
      status: false,
      message: err.message || "Failed to search TMDB movies",
    });
  }
};

export const importTmdbMovieHandler = async (
  request: FastifyRequest<{ Body: ImportTmdbRequestSchema }>,
  reply: FastifyReply,
) => {
  try {
    const { tmdbId } = request.body;
    const movie = await getOrCreateMovieByTmdbId(tmdbId);

    responseSender({
      reply,
      code: 201,
      status: true,
      message: "Movie imported successfully",
      data: movie,
    });
  } catch (err: any) {
    console.error("Import TMDB movie error:", err);
    responseSender({
      reply,
      code: 500,
      status: false,
      message: err.message || "Failed to import TMDB movie",
    });
  }
};
