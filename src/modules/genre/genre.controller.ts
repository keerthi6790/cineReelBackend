import { FastifyReply, FastifyRequest } from "fastify";
import { responseSender } from "../../utils/responseSender";
import prisma from "../../utils/prisma";

export const getGenre = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const availableGenre = await prisma.genre.findMany({});

    if (availableGenre) {
      responseSender({
        reply,
        code: 201,
        status: true,
        data: availableGenre,
      });
    } else {
      responseSender({
        reply,
        code: 500,
        status: false,
        message: "Something went Wrong!",
      });
    }
  } catch (err) {
    responseSender({
      reply,
      code: 500,
      status: false,
      message: "Something went Wrong!",
      data: err,
    });
  }
};
