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

export class AppConfigService {
  static async getAppConfig() {
    const config = appConfigCache.get(KEY);

    if (!config) {
      return updateLevelCache();
    }

    return config;
  }

  static async createAppConfig(
    config: Partial<AppConfigModel> & { guild_id: string }
  ) {
    await prisma.appConfig.create({
      data: config,
    });
  }

  static async updateAppConfig(config: Partial<AppConfigModel>) {
    await prisma.appConfig.updateMany({
      data: config,
    });
  }
}
