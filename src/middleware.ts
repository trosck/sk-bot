import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  ErrorRequestHandler,
} from "express";
import { isDev, JWT_SECRET_ACCESS } from "./config.js";
import { logger } from "./logger.js";
import jwt from "jsonwebtoken";
import { GuildMemberSyncService } from "./services/guild-member-sync.service.js";
import { AppConfigService } from "./services/app-config.service.js";

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

export const authMiddleware: RequestHandler = async (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({ error: "No access token 🫥" });
  }

  let decoded: { id: string };
  try {
    decoded = jwt.verify(token, JWT_SECRET_ACCESS) as { id: string };
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  if (decoded.id === "admin") {
    return next();
  }

  const user = await GuildMemberSyncService.getUser(decoded.id);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const appConfig = await AppConfigService.getAppConfig();

  const hasAccessRole = appConfig.access_roles.some((role) => user.roles.includes(role));
  if (!hasAccessRole) {
    return res.status(401).json({ error: "User does not have access role" });
  }

  return next();
};

export const adminMiddleware: RequestHandler = async (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({ error: "No access token 🫥" });
  }

  let decoded: { id: string };
  try {
    decoded = jwt.verify(token, JWT_SECRET_ACCESS) as { id: string };
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  if (decoded.id !== "admin") {
    return res.status(401).json({ error: "User is not admin" });
  }

  return next();
}