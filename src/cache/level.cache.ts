import { NodeCache } from "@cacheable/node-cache";
import type { Level } from "@prisma/client";
import { prisma } from "../prisma.js";

const KEY = "level";
const levelCache = new NodeCache<Level[]>();

async function updateLevelCache() {
  const levels = await prisma.level.findMany();

  levelCache.set(KEY, levels);

  return levels;
}

export async function getLevel(): Promise<Level[]> {
  const level = levelCache.get(KEY);

  if (!level) {
    return updateLevelCache();
  }

  return level;
}
