import cron from "node-cron";

import { scheduleChannelPost } from "./channelPost.js";

export function scheduleTasks() {
  // every minute
  cron.schedule("* * * * *", () => {
    // scheduleChannelPost();
  });
}
