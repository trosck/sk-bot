import type { Guild } from "discord.js";

import { logger } from "../../logger.js";
import { prisma } from "../../prisma.js";
import { GuildMemberSyncService } from "./guild-member-sync.service.js";

export class GuildInitializationService {
  static async init(guild: Guild) {
    const isConfigExists = await prisma.appConfig.findUnique({
      where: {
        guild_id: guild.id,
      },
    });

    if (isConfigExists) {
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

    await GuildMemberSyncService.initUsers(guild);

    logger.info(`Guild ${guild.name} initialized`);
  }
}
