import type { Guild } from "discord.js";

import { logger } from "../../logger.js";
import { prisma } from "../../prisma.js";
import { AppConfigService } from "../app-config.service.js";

export class GuildInitializationService {
  static async init(guild: Guild) {
    const config = await AppConfigService.getAppConfig();

    if (config) {
      return;
    }

    await AppConfigService.createAppConfig({ guild_id: guild.id });

    logger.debug(
      `added to guild: ${guild.name}. member count: ${guild.memberCount}`
    );

    logger.info(`Guild ${guild.name} initialized`);
  }
}
