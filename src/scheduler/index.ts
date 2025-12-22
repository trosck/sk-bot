import cron from "node-cron";

import { scheduleChannelPost } from "./channel-post.js";
import { schedulePromoCat } from "./promo-cat.js";
import { logger } from "../logger.js";

export function scheduleTasks() {
  // every minute
  cron.schedule("* * * * *", () => {
    logger.debug("check cron");
    scheduleChannelPost();
    schedulePromoCat();
  });
}
