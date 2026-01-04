import { Guild, Role } from "discord.js";
import { logger } from "../../logger.js";
import { prisma } from "../../prisma.js";
import { upsertRolesBatch } from "../../helpers/upsert-roles-batch.js";

export class GuildRoleSyncService {
  static async syncRoles(guild: Guild) {
    const roles = await guild.roles.fetch();

    await upsertRolesBatch(Array.from(roles.values()), 100);

    logger.info("Roles list updated");
  }

  static async addRole(role: Role) {
    await prisma.role.create({
      data: {
        id: role.id,
        name: role.name,
      },
    });
  }

  static async updateRole(role: Role) {
    await prisma.role.update({
      data: {
        name: role.name,
      },
      where: {
        id: role.id,
      },
    });
  }

  static async deleteRole(role: Role) {
    await prisma.role.delete({
      where: {
        id: role.id,
      },
    });
  }
}
