import { NodeCache } from "@cacheable/node-cache";
import { LevelModel } from "../../generated/prisma/models.js";
import { prisma } from "../prisma.js";

const KEY = "level";
const levelCache = new NodeCache<LevelModel[]>({
  stdTTL: "30m",
});

async function updateLevelCache() {
  const levels = await prisma.level.findMany();

  levelCache.set(KEY, levels);

  return levels;
}

export class LevelService {
  static async getLevels() {
    const levels = levelCache.get(KEY);

    if (!levels) {
      return updateLevelCache();
    }

    return levels;
  }
}
