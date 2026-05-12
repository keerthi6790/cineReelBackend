import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { FastifyReply, FastifyRequest } from "fastify";
import S3ClientInstance from "../../utils/aws";
import { Upload } from "@aws-sdk/lib-storage";
import { responseSender } from "../../utils/responseSender";

export const uploadImage = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const data = await request.file(); // From @fastify/multipart

  if (!data) {
    responseSender({ reply, code: 500, status: false });
  }

  const parallelUploads3 = new Upload({
    client: S3ClientInstance,
    params: {
      Bucket: "moviiiuserprofiledata",
      Key: data.filename,
      Body: data.file, // This is the stream
      ContentType: data.mimetype,
    },
    // Optional: adjust part size for very large files
    queueSize: 4,
    partSize: 1024 * 1024 * 5, // 5MB
  });

  try {
    const response = await parallelUploads3.done();

    console.log({ response, parallelUploads3 });

    responseSender({
      reply,
      code: 201,
      status: true,
      message: "Upload Successfully!",
      data: response?.Location || "",
    });
  } catch (err) {
    console.log(err);
    reply.code(500).send({ error: "Upload failed" });
  }
};

export const deleteUploadImage = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params;

  // 2. Delete from AWS S3
  const s3Params = {
    Bucket: "moviiiuserprofiledata",
    Key: id,
  };

  try {
    await S3ClientInstance.send(new DeleteObjectCommand(s3Params));

    // 3. Delete from your database (e.g., PostgreSQL, MongoDB)
    // await db.query('DELETE FROM images WHERE id = $1', [id]);

    return { success: true, message: "Image deleted successfully" };
  } catch (err) {
    console.log(err);
    reply.code(500).send({ error: "Failed to delete image" });
  }
};
