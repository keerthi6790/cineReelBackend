require("dotenv").config();
import buildServer from "./server";

const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const host = process.env.HOST || "0.0.0.0";
const server = buildServer();

async function main() {
  try {
    await server.listen({ port, host });

    console.log(`CMS Backend Server running on http://localhost:${port}`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();

