import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  ErrorRequestHandler,
} from "express";
import { NODE_ENV } from "./config.js";
import { logger } from "./logger.js";

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
