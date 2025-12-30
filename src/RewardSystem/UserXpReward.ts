import type { Message, User } from "discord.js";
import { UserNotFound } from "../errors/UserNotFound.js";
import { prisma } from "../prisma.js";
import { getLevel } from "../cache/level.cache.js";
import { UserModel } from "../../generated/prisma/models.js";
import { logger } from "../logger.js";

const rewards = {
  message: 10,
};

export class UserXpReward {
  static async rewardUser(user: UserModel, xp: number) {
    let userLevel = user.level;
    const totalXp = user.total_xp + xp;

    const level = await getLevel();
    const levelIndex = level.findIndex((item) => item.level_id === userLevel);

    const nextLevel = level[levelIndex + 1];
    if (nextLevel && totalXp >= nextLevel.xp) {
      userLevel = nextLevel;
    }

    try {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          total_xp: totalXp,
          level: userLevel,
        },
      });
    } catch (err) {
      logger.error(`Fail to reward user: [${user.id}] ${user.username}`);
    }
  }

  static async messageActivity(message: Message) {
    if (message.author.bot) {
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        discord_id: message.author.id,
      },
    });

    if (!user) {
      throw new UserNotFound();
    }

    await UserXpReward.rewardUser(user, rewards.message);
  }

  async voiceActivity(user: User) {}
}
