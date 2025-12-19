import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  ErrorRequestHandler,
} from "express";
import { JWT_SECRET_ACCESS, NODE_ENV } from "./config.js";
import { logger } from "./logger.js";
import jwt from "jsonwebtoken";

const isDev = NODE_ENV === "development";

export const logMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    if (isDev) {
      logger.debug({
        method: req.method,
        url: req.originalUrl || req.url,
        httpVersion: req.httpVersion,
        ip: req.ip,
        params: req.params,
        query: req.query,
        headers: req.headers,
        body: req.body,
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
      });
    } else {
      logger.info({
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
      });
    }
  });

  next();
};

export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;

  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
      status,
      params: req.params,
      query: req.query,
      body: req.body,
    },
    "Unhandled error in request"
  );

  const data: any = {
    success: false,
    message: err.message || "Internal server error",
  };

  if (isDev) {
    data.stack = err.stack;
  }

  res.status(status).json(data);
};

export const authMiddleware: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    jwt.verify(token, JWT_SECRET_ACCESS);
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
