import cron from "node-cron";

import { scheduleChannelPost } from "./channel-post.js";
import { schedulePromoCat } from "./promo-cat.js";

import { logger } from "../logger.js";
import { client } from "../gateway/index.js";

import { GuildMemberSyncService } from "../services/guild/guild-member-sync.service.js";
import { GuildChannelSyncService } from "../services/guild/guild-channel-sync.service.js";

export async function scheduleTasks() {
  const guild = await client.guilds.cache.first();

  // every minute
  cron.schedule("* * * * *", () => {
    scheduleChannelPost();
    schedulePromoCat();
  });

  // every hour
  cron.schedule("0 * * * *", () => {
    if (guild) {
      GuildChannelSyncService.syncChannels(guild);
      GuildMemberSyncService.updateUsers(guild);
    } else {
      logger.error("no guild in cache");
    }
  });
}
