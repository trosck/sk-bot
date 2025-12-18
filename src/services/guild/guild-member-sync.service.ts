import {
  APIGuildMember,
  Routes,
  type Guild,
  type RESTGetAPIGuildMemberResult,
} from "discord.js";

import { logger } from "../../logger.js";
import { DiscordRequest } from "../../request.js";
import { prisma } from "../../prisma.js";
import {
  upsertUsersBatch,
  type UserSyncInput,
} from "../../helpers/upsert-users-batch.js";
import { writeFileSync } from "node:fs";

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

function memberToUser(member: APIGuildMember) {
  return {
    avatar: member.user.avatar,
    discord_id: member.user.id,
    global_name: member.user.global_name,
    username: member.user.username,
    nickname: member.nick,
    roles: member.roles,
  };
}

export class GuildMemberSyncService {
  static async initUsers(guild: Guild) {
    await fetchUsers(guild.id, async (users) => {
      await prisma.user.createMany({
        data: users.map(memberToUser),
      });
    });
  }

  static async updateUsers(guild: Guild) {
    await fetchUsers(guild.id, async (users) => {
      const userList: UserSyncInput[] = users.map(memberToUser);

      await upsertUsersBatch(userList, LIMIT);
    });

    logger.info("User list updated");
  }
}
