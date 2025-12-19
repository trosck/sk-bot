import "dotenv/config";

import express from "express";
import { pinoHttp } from "pino-http";
import cors from "cors";
import cookieParser from "cookie-parser";

import { logger } from "./logger.js";
import { NODE_ENV } from "./config.js";
import { errorMiddleware } from "./middleware.js";
import { apiRouter } from "./api/index.js";

const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(
  pinoHttp({
    serializers: {
      req(req) {
        delete req.headers;
        delete req.remoteAddress;
        delete req.remotePort;
        req.body = req.raw.body;
        return req;
      },
      res(res) {
        delete res.headers;
        return res;
      },
    },
  })
);

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id"],
    credentials: true,
    maxAge: 86400,
  })
);

app.use("/api", apiRouter);

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
