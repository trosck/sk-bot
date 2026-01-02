import { NodeCache } from "@cacheable/node-cache";

import { prisma } from "../prisma.js";
import { AppConfigModel } from "../../generated/prisma/models.js";

const KEY = "app-config";
const appConfigCache = new NodeCache<AppConfigModel>({
  stdTTL: "30m",
});

async function updateLevelCache() {
  const config = await prisma.appConfig.findFirst();

  if (!config) {
    throw new Error("No config row");
  }

  appConfigCache.set(KEY, config);

  return config;
}

export async function getAppConfig() {
  const config = appConfigCache.get(KEY);

  if (!config) {
    return updateLevelCache();
  }

  return config;
}
