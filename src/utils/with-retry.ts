import { logger } from "../logger.js";

export async function withRetry(cb: () => Promise<any>) {
  let attempt = 0;
  const retries = 3;

  while (++attempt <= retries) {
    try {
      await cb();
      return;
    } catch (err) {
      logger.debug("Failed attempt " + attempt);
      continue;
    }
  }
}
