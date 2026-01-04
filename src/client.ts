import { Client, GatewayIntentBits } from "discord.js";

import { logger } from "./logger.js";
import { UserXpReward } from "./RewardSystem/UserXpReward.js";
import { GuildInitializationService } from "./services/guild/guild-initialization.service.js";
import { GuildChannelSyncService } from "./services/guild/guild-channel-sync.service.js";
import { GuildMemberSyncService } from "./services/guild/guild-member-sync.service.js";
import { GuildCommandSyncService } from "./services/guild/guild-command-sync.service.js";
import { prisma } from "./prisma.js";

const client = new Client({
  // https://discord.com/developers/docs/events/gateway#list-of-intents
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.on("clientReady", async () => {
  logger.info(`Logged in as ${client.user?.tag}`);

  const guild = client.guilds.cache.at(0);
  if (guild) {
    await GuildMemberSyncService.updateUsers(guild);
    await GuildChannelSyncService.syncChannels(guild);
  }
});

// client.on("guildMemberAdd", async (member) => {
//   await prisma.user.create({
//     data: {
//       avatar: member.avatar,
//       discord_id: member.id,
//     },
//   });
// });

client.on("messageCreate", async (message) => {
  logger.debug(`${message.author.displayName}: ${message.content}`);
  await UserXpReward.messageActivity(message);
});

client.on("voiceStateUpdate", async (state) => {
  // const guild = client.guilds.cache.at(0);
  // if (guild) {
  //   await GuildStateManager.logChannels(guild);
  // }
});

client.on("guildCreate", async (guild) => {
  await GuildInitializationService.init(guild);
  await GuildChannelSyncService.syncChannels(guild);
  await GuildCommandSyncService.syncCommands(guild);
});

client.on("channelCreate", async (channel) => {
  logger.debug({ channel });
});

client.on("channelDelete", async (channel) => {
  logger.debug({ channel });
});

export { client };

export function initDiscordGateway(token: string) {
  return client.login(token);
}
