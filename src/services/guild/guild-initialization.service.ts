import type { Guild } from "discord.js";

import { logger } from "../../logger.js";
import { prisma } from "../../prisma.js";
import { getAppConfig } from "../../cache/app-config.cache.js";

export class GuildInitializationService {
  static async init(guild: Guild) {
    const config = await getAppConfig();

    if (config) {
      return;
    }

    await prisma.appConfig.create({
      data: {
        guild_id: guild.id,
      },
    });

    logger.debug(
      `added to guild: ${guild.name}. member count: ${guild.memberCount}`
    );

    logger.info(`Guild ${guild.name} initialized`);
  }
}
