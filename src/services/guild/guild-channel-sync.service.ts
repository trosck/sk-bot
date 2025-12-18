import type { Guild } from "discord.js";

import { logger } from "../../logger.js";
import { upsertChannelsBatch } from "../../helpers/upsert-channels-batch.js";

export class GuildChannelSyncService {
  static async syncChannels(guild: Guild) {
    const channels = guild.channels.cache.map((channel) => ({
      id: channel.id,
      type: channel.type,
      name: channel.name,
    }));

    await upsertChannelsBatch(channels, channels.length);

    logger.info("Guild channels updated");
  }
}
