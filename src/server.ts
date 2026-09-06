import { Server } from "http";
import app from "./app";
import config from "./config";
import connectDB from "./app/lib/mongoose";
import seedSuperAdmin from "./app/seedSuperAdmin";

const port = config.port || 5000;

async function main() {
  await connectDB();
  seedSuperAdmin();

  const server: Server = app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info("Server closed!");
      });
    }
    process.exit(1);
  };

  process.on("uncaughtException", (error) => {
    console.log(error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.log(error);
    exitHandler();
  });
}

main();
