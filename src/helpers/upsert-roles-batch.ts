import { prisma } from "../prisma.js";

export type RoleSyncInput = {
  id: string;
  name: string;
};

export async function upsertRolesBatch(
  roles: RoleSyncInput[],
  batchSize: number
) {
  if (roles.length === 0) return;

  for (let start = 0; start < roles.length; start += batchSize) {
    const batch = roles.slice(start, start + batchSize);

    const valuesPlaceholders: string[] = [];
    const queryParams: any[] = [];

    batch.forEach((role, index) => {
      const baseIndex = index * 2;

      // ($1, $2), ($3, $4)...
      valuesPlaceholders.push(`($${baseIndex + 1}, $${baseIndex + 2})`);

      queryParams.push(role.id, role.name);
    });

    const sql = `
      INSERT INTO "Role" (
        "id",
        "name"
      )
      VALUES
        ${valuesPlaceholders.join(",\n")}
      ON CONFLICT ("id")
      DO UPDATE
      SET
        "name" = EXCLUDED."name"
    `;

    await prisma.$executeRawUnsafe(sql, ...queryParams);
  }
}
