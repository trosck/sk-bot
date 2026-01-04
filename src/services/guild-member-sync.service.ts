import {
  APIGuildMember,
  GuildMember,
  Routes,
  type Guild,
  type RESTGetAPIGuildMemberResult,
} from "discord.js";

import { logger } from "../logger.js";
import { DiscordRequest } from "../request.js";
import { prisma } from "../prisma.js";
import {
  upsertUsersBatch,
  type UserSyncInput,
} from "../helpers/upsert-users-batch.js";

/**
 * guild members pagination limit (1-1000)
 */
const LIMIT = 1000;

async function fetchUsers(
  guildId: string,
  cb: (users: RESTGetAPIGuildMemberResult[]) => Promise<void>
) {
  const query = new URLSearchParams();
  query.set("limit", LIMIT.toString());

  let after = "0";
  while (true) {
    query.set("after", after);

    const guildMembers = await DiscordRequest.get<
      RESTGetAPIGuildMemberResult[]
    >(Routes.guildMembers(guildId), { query });

    await cb(guildMembers);

    if (guildMembers.length < LIMIT) {
      break;
    }

    after = guildMembers[guildMembers.length - 1]?.user.id.toString() ?? "";
  }
}

function apiMemberToUser(member: APIGuildMember) {
  return {
    avatar: member.user.avatar,
    discord_id: member.user.id,
    global_name: member.user.global_name,
    username: member.user.username,
    nickname: member.nick ?? null,
    roles: member.roles,
  };
}

function guildMemberToUser(member: GuildMember) {
  const roles = Array.from(member.roles.cache.values()).map((role) => role.id);

  return {
    avatar: member.user.avatar,
    discord_id: member.user.id,
    global_name: member.user.globalName,
    username: member.user.username,
    nickname: member.nickname,
    roles: roles,
  };
}

export class GuildMemberSyncService {
  static async initUsers(guild: Guild) {
    await fetchUsers(guild.id, async (users) => {
      await prisma.user.createMany({
        data: users.map(apiMemberToUser),
      });
    });
  }

  static async syncUsers(guild: Guild) {
    await fetchUsers(guild.id, async (users) => {
      const userList: UserSyncInput[] = users.map(apiMemberToUser);

      await upsertUsersBatch(userList, LIMIT);
    });

    logger.info("User list updated");
  }

  static async addUser(user: GuildMember) {
    await prisma.user.create({
      data: guildMemberToUser(user),
    });
  }

  static async updateUser(user: GuildMember) {
    await prisma.user.update({
      data: guildMemberToUser(user),
      where: {
        discord_id: user.id,
      },
    });
  }

  static async deleteUser(user: GuildMember) {
    await prisma.user.delete({
      where: {
        discord_id: user.id,
      },
    });
  }
}
