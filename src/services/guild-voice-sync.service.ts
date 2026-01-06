import { GuildChannel, GuildMember, User, VoiceState } from "discord.js";
import { prisma } from "../prisma.js";
import { UserXpReward } from "../RewardSystem/UserXpReward.js";
import { logger } from "../logger.js";

function isJoined(oldState: VoiceState, newState: VoiceState) {
  return !oldState.channelId && newState.channelId;
}

function isLeft(oldState: VoiceState, newState: VoiceState) {
  return oldState.channelId && !newState.channelId;
}

function isMuted(state: VoiceState) {
  return state.selfMute;
}

function isDeafened(state: VoiceState) {
  return state.selfDeaf;
}

function isUnmuted(oldState: VoiceState, newState: VoiceState) {
  return oldState.selfMute && !newState.selfMute;
}

export class GuildVoiceSync {
  static async startSession(member: GuildMember, channel: GuildChannel) {
    const session = await prisma.voiceSession.create({
      data: {
        user_id: member.user.id,
      },
    });

    return session;
  }

  static async endSession(member: GuildMember) {
    const session = await prisma.voiceSession.findFirst({
      where: {
        user_id: member.user.id,
      },
    })

    if (!session) {
      return null;
    }

    const now = new Date();
    const startedAt = session.started_at;
    const duration = now.getTime() - startedAt.getTime();

    await prisma.voiceSession.delete({
      where: {
        user_id: member.user.id,
      },
    });

    await UserXpReward.voiceActivity(member, duration / 1000);

    return duration;
  }

  static async handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    if (isJoined(oldState, newState)) {
      await this.startSession(newState.member!, newState.channel!);
      logger.debug(`Started voice session for ${newState.member!.user.username} in ${newState.channel!.name}`);
    }

    if (isMuted(newState) || isDeafened(newState) || isLeft(oldState, newState)) {
      await this.endSession(newState.member!);
      logger.debug(`Ended voice session for ${newState.member!.user.username} in ${oldState.channel!.name}`);
    }

    if (isUnmuted(oldState, newState)) {
      await this.startSession(newState.member!, newState.channel!);
      logger.debug(`User ${newState.member!.user.username} unmuted in ${newState.channel!.name}, started voice session`);
    }
  }
}