import pino from "pino";
import { LOG_LEVEL } from "./config.js";

export const logger = pino({
  // https://github.com/pinojs/pino/blob/main/docs/api.md#loggerlevel-string-gettersetter
  level: LOG_LEVEL,
});
