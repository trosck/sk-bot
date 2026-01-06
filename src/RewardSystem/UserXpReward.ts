import type { GuildMember, Message } from "discord.js";
import { prisma } from "../prisma.js";
import { UserModel } from "../../generated/prisma/models.js";
import { logger } from "../logger.js";
import { LevelService } from "../services/level.service.js";
import { GuildMemberSyncService } from "../services/guild-member-sync.service.js";

const rewards = {
  message: 10,
  voice: 20,
};

export class UserXpReward {
  static async rewardUser(user: UserModel, xp: number) {
    let userLevel = user.level;
    const totalXp = user.total_xp + xp;

    const level = await LevelService.getLevels();
    const levelIndex = level.findIndex((item) => item.id === userLevel);

    const nextLevel = level[levelIndex + 1];
    if (nextLevel && totalXp >= nextLevel.xp) {
      userLevel = nextLevel.id;
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

    const userModel = await GuildMemberSyncService.getOrCreateUser(message.member!);

    await UserXpReward.rewardUser(userModel, rewards.message);
  }

  /**
   * @param user - User
   * @param duration - Duration in seconds
   */
  static async voiceActivity(member: GuildMember, duration: number) {
    if (member.user.bot) {
      return;
    }

    const userModel = await GuildMemberSyncService.getOrCreateUser(member);

    await this.rewardUser(userModel, Math.floor(duration / 60 * rewards.voice));
  }
}
