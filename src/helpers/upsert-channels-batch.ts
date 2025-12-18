import { prisma } from "../prisma.js";

export type ChannelSyncInput = {
  id: string;
  name: string;
  type: number;
};

export async function upsertChannelsBatch(
  channels: ChannelSyncInput[],
  batchSize: number
) {
  if (channels.length === 0) return;

  for (let start = 0; start < channels.length; start += batchSize) {
    const batch = channels.slice(start, start + batchSize);

    const valuesPlaceholders: string[] = [];
    const queryParams: any[] = [];

    batch.forEach((channel, index) => {
      const baseIndex = index * 3;

      // ($1, $2, $3)...
      valuesPlaceholders.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`
      );

      queryParams.push(channel.id, channel.name, channel.type);
    });

    const sql = `
      INSERT INTO "Channel" (
        "id",
        "name",
        "type"
      )
      VALUES
        ${valuesPlaceholders.join(",\n")}
      ON CONFLICT ("id")
      DO UPDATE
      SET
        "name"    = EXCLUDED."name",
        "type"    = EXCLUDED."type"
    `;

    await prisma.$executeRawUnsafe(sql, ...queryParams);
  }
}
