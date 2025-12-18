import { prisma } from "../prisma.js";

export type UserSyncInput = {
  discord_user_id: string;
  username?: string | null;
  nickname?: string | null;
  global_name?: string | null;
  avatar?: string | null;
  roles: string[];
};

export async function upsertUsersBatch(
  users: UserSyncInput[],
  batchSize: number
) {
  if (users.length === 0) return;

  for (let start = 0; start < users.length; start += batchSize) {
    const batch = users.slice(start, start + batchSize);

    const valuesPlaceholders: string[] = [];
    const queryParams: any[] = [];

    batch.forEach((user, index) => {
      const baseIndex = index * 6;

      // ($1, $2, $3, $4, $5::text[])...
      valuesPlaceholders.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${
          baseIndex + 4
        }, $${baseIndex + 5}, $${baseIndex + 6}::text[])`
      );

      queryParams.push(
        user.discord_user_id,
        user.username ?? null,
        user.nickname ?? null,
        user.global_name ?? null,
        user.avatar ?? null,
        user.roles ?? []
      );
    });

    const sql = `
      INSERT INTO "User" (
        "discord_user_id",
        "username",
        "nickname",
        "global_name",
        "avatar",
        "roles"
      )
      VALUES
        ${valuesPlaceholders.join(",\n")}
      ON CONFLICT ("discord_user_id")
      DO UPDATE
      SET
        "username"    = EXCLUDED."username",
        "nickname"    = EXCLUDED."nickname",
        "global_name" = EXCLUDED."global_name",
        "roles"       = EXCLUDED."roles",
        "avatar"      = EXCLUDED."avatar",
        "updated_at"  = NOW()
    `;

    await prisma.$executeRawUnsafe(sql, ...queryParams);
  }
}
