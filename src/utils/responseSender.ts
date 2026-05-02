import { FastifyReply } from "fastify";

interface IResponseSender {
  reply: FastifyReply;
  code: 201 | 500 | 400;
  status: true | false;
  message?: string;
  data?: any;
}

export const responseSender = ({
  reply,
  code,
  status,
  message,
  data,
}: IResponseSender) => {
  reply.code(code).send({
    status,
    message,
    data,
  });
};
