import { NodeCache } from "@cacheable/node-cache";
import type { Level } from "@prisma/client";
import { prisma } from "../prisma.js";

const KEY = "level";
const levelCache = new NodeCache<Level[]>();

async function updateLevelCache() {
  const level = await prisma.level.findMany({
    orderBy: {
      level_id: "asc",
    },
  });
  levelCache.set(KEY, level);
  return level;
}

export async function getLevel(): Promise<Level[]> {
  const level = levelCache.get(KEY);

  if (!level) {
    return updateLevelCache();
  }

  return level;
}
