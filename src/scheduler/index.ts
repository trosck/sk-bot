import cron from "node-cron";

import { scheduleChannelPost } from "./channel-post.js";
import { schedulePromoCat } from "./promo-cat.js";

export function scheduleTasks() {
  // every minute
  cron.schedule("* * * * *", () => {
    // scheduleChannelPost();
    schedulePromoCat();
  });
}
