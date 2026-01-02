import { NodeCache } from "@cacheable/node-cache";

import { prisma } from "../prisma.js";
import { LevelModel } from "../../generated/prisma/models.js";

const KEY = "level";
const levelCache = new NodeCache<LevelModel[]>({
  stdTTL: "30m",
});

async function updateLevelCache() {
  const levels = await prisma.level.findMany();

  levelCache.set(KEY, levels);

  return levels;
}

export async function getLevel() {
  const levels = levelCache.get(KEY);

  if (!levels) {
    return updateLevelCache();
  }

  return levels;
}
