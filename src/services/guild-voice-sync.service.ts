import { Guild, GuildChannel, GuildMember, User, VoiceState } from "discord.js";
import { prisma } from "../prisma.js";
import { UserXpReward } from "../RewardSystem/UserXpReward.js";
import { logger } from "../logger.js";
import { VoiceSession } from "../../generated/prisma/client.js";

function isJoined(oldState: VoiceState, newState: VoiceState) {
  return !oldState.channelId && newState.channelId;
}

function isLeft(oldState: VoiceState, newState: VoiceState) {
  return oldState.channelId && !newState.channelId;
}

function isMuted(state: VoiceState) {
  return state.selfMute;
}

function isUnmuted(oldState: VoiceState, newState: VoiceState) {
  return oldState.selfMute && !newState.selfMute;
}

export class GuildVoiceSync {
  static async startSession(member: GuildMember) {
    const session = await prisma.voiceSession.upsert({
      where: {
        user_id: member.user.id,
      },
      update: {},
      create: {
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
    const durationSeconds = duration / 1000;

    await prisma.voiceSession.delete({
      where: {
        user_id: member.user.id,
      },
    });

    await prisma.user.update({
      where: {
        discord_id: member.user.id,
      },
      data: {
        voice_chat: durationSeconds,
      },
    });

    await UserXpReward.voiceActivity(member, durationSeconds);

    return duration;
  }

  static async handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    if (isMuted(newState) || isLeft(oldState, newState)) {
      await this.endSession(newState.member!);
      logger.debug(`Ended voice session for ${newState.member!.user.username} in ${oldState.channel!.name}`);
      return;
    }

    if (isJoined(oldState, newState) || isUnmuted(oldState, newState)) {
      await this.startSession(newState.member!);
      logger.debug(`Started voice session for ${newState.member!.user.username} in ${newState.channel!.name}`);
      return;
    }
  }

  static async syncSessions(guild: Guild) {
    const sessions = await prisma.voiceSession.findMany({});

    const sessionsMap = new Map<string, VoiceSession>(sessions.map((session) => [session.user_id, session]));

    const activeMembersMap = new Map<string, GuildMember>();

    for (const state of guild.voiceStates.cache.values()) {
      const member = state.member!;

      if (!isMuted(state)) {
        activeMembersMap.set(member.user.id, member);

        const session = sessionsMap.get(member.user.id);
        if (!session) {
          await this.startSession(member);
          logger.debug(`Started voice session for ${member.user.username} in ${state.channel!.name}`);
          continue;
        }
      }
    }

    for (const session of sessions) {
      const activeMember = activeMembersMap.get(session.user_id);
      if (activeMember) {
        continue;
      }

      const member = guild.members.cache.get(session.user_id);
      if (!member) {
        continue;
      }

      await this.endSession(member);
      logger.debug(`Ended voice session for ${member.user.username}`);
    }
  }
}