import { logger } from "../logger.js";
import { sleep } from "./sleep.js";

export async function withRetry(cb: () => Promise<any>) {
  let attempt = 0;
  const retries = 3;

  while (++attempt <= retries) {
    if (attempt > 1) {
      const delay = 1 << attempt;
      await sleep(delay * 1000);
    }

    try {
      await cb();
      return;
    } catch (err) {
      logger.debug("Failed attempt " + attempt);
      continue;
    }
  }
}
