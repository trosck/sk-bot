import { Guild, Routes } from "discord.js";

import { DiscordRequest } from "../../request.js";
import { APP_ID } from "../../config.js";
import { logger } from "../../logger.js";
import { DiscordCommandList } from "../../interactions/index.js";

export class GuildCommandSyncService {
  static async syncCommands(guild: Guild) {
    try {
      await DiscordRequest.put(
        Routes.applicationGuildCommands(APP_ID, guild.id),
        {
          body: DiscordCommandList,
        }
      );

      logger.info("Successfully updated guild application commands.");
    } catch (error) {
      logger.error(error);
    }
  }
}
