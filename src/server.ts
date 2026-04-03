import app from "./app";
import { config } from "./config";

const startServer = async () => {
  try {
    app.listen(config.port, () => {
      console.log("══════════════════════════════════════════════════════");
      console.log("  Finance Data Processing & Access Control API");
      console.log("══════════════════════════════════════════════════════");
      console.log(`  Environment : ${config.nodeEnv}`);
      console.log(`  Server      : http://localhost:${config.port}`);
      console.log(`  API Docs    : http://localhost:${config.port}/api-docs`);
      console.log(`  Health      : http://localhost:${config.port}/health`);
      console.log("══════════════════════════════════════════════════════");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
