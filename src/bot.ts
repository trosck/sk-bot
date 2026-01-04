import "dotenv/config";

import express from "express";
import { pinoHttp } from "pino-http";
import { verifyKeyMiddleware } from "discord-interactions";

import { logger } from "./logger.js";
import { DISCORD_TOKEN, NODE_ENV, PUBLIC_KEY } from "./config.js";
import { errorMiddleware } from "./middleware.js";
import { client, initDiscordGateway } from "./client.js";
import handleDiscordInteractions from "./interactions/index.js";
import { GuildCommandSyncService } from "./services/guild-command-sync.service.js";
import { scheduleTasks } from "./scheduler/index.js";

await initDiscordGateway(DISCORD_TOKEN);

scheduleTasks();

const guild = client.guilds.cache.first();
if (guild) {
  GuildCommandSyncService.syncCommands(guild);
}

const app = express();
const PORT = 4000;

app.use(pinoHttp());

app.post(
  "/bot/interactions",
  verifyKeyMiddleware(PUBLIC_KEY),
  handleDiscordInteractions
);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Not found",
  });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  if (NODE_ENV === "development") {
    logger.debug(`
⚡ Server is up!

  • Environment: ${NODE_ENV}
  • PID:         ${process.pid}
  • Node:        ${process.version}
  • Port:        ${PORT}

Press CTRL+C to stop.
`);
  } else {
    logger.info(
      {
        event: "server_started",
        env: NODE_ENV,
        port: PORT,
        pid: process.pid,
        node: process.version,
        uptime_sec: process.uptime().toFixed(2),
      },
      "Server listening"
    );
  }
});

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  process.exit(1);
});
