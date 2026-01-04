import type { Guild, GuildChannel } from "discord.js";

import { logger } from "../../logger.js";
import { upsertChannelsBatch } from "../../helpers/upsert-channels-batch.js";
import { prisma } from "../../prisma.js";

export class GuildChannelSyncService {
  static async syncChannels(guild: Guild) {
    const oldChannels = await prisma.channel.findMany({
      select: {
        id: true,
      },
    });

    const channelsSet = new Set();
    const channels = guild.channels.cache.map((channel) => {
      channelsSet.add(channel.id);
      return {
        id: channel.id,
        type: channel.type,
        name: channel.name,
      };
    });

    await upsertChannelsBatch(channels, channels.length);

    const deletedChannels = [];
    for (const channel of oldChannels) {
      if (!channelsSet.has(channel.id)) {
        deletedChannels.push(channel.id);
      }
    }

    if (deletedChannels.length) {
      await prisma.$transaction([
        prisma.scheduledPost.deleteMany({
          where: {
            channel_id: {
              in: deletedChannels,
            },
          },
        }),
        prisma.channel.deleteMany({
          where: {
            id: {
              in: deletedChannels,
            },
          },
        }),
      ]);

      logger.debug(`deleted ${deletedChannels.length} channels`);
    }

    logger.info("Guild channels updated");
  }

  static async createChannel(channel: GuildChannel) {
    await prisma.channel.create({
      data: {
        id: channel.id,
        name: channel.name,
        type: channel.type,
      },
    });
  }

  static async updateChannel(channel: GuildChannel) {
    await prisma.channel.update({
      data: {
        name: channel.name,
        type: channel.type,
      },
      where: {
        id: channel.id,
      },
    });
  }

  static async deleteChannel(channel: GuildChannel) {
    await prisma.channel.delete({
      where: {
        id: channel.id,
      },
    });
  }
}
