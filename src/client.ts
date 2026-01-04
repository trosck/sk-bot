import {
  Client,
  GatewayIntentBits,
  GuildChannel,
  GuildMember,
} from "discord.js";

import { logger } from "./logger.js";
import { UserXpReward } from "./RewardSystem/UserXpReward.js";
import { GuildInitializationService } from "./services/guild-initialization.service.js";
import { GuildChannelSyncService } from "./services/guild-channel-sync.service.js";
import { GuildMemberSyncService } from "./services/guild-member-sync.service.js";
import { GuildCommandSyncService } from "./services/guild-command-sync.service.js";
import { prisma } from "./prisma.js";
import { GuildRoleSyncService } from "./services/guild-role-sync.service.js";

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
    await GuildRoleSyncService.syncRoles(guild);
    await GuildMemberSyncService.syncUsers(guild);
    await GuildChannelSyncService.syncChannels(guild);
  }
});

/** Roles */

client.on("roleCreate", async (role) => {
  await GuildRoleSyncService.addRole(role);
  logger.debug(`Added role ${role.name}`);
});

client.on("roleUpdate", async (role) => {
  await GuildRoleSyncService.updateRole(role);
  logger.debug(`Updated role ${role.name}`);
});

client.on("roleDelete", async (role) => {
  await GuildRoleSyncService.deleteRole(role);
  logger.debug(`Deleted role ${role.name}`);
});

/** Users */

client.on("guildMemberAdd", async (member) => {
  await GuildMemberSyncService.addUser(member);
  logger.debug(`Added user ${member.user.username}`);
});

client.on("guildMemberUpdate", async (member) => {
  await GuildMemberSyncService.updateUser(member as GuildMember);
  logger.debug(`Updated user ${member.user.username}`);
});

client.on("guildMemberRemove", async (member) => {
  await GuildMemberSyncService.deleteUser(member as GuildMember);
  logger.debug(`Deleted user ${member.user.username}`);
});

/** Channels */

client.on("channelCreate", async (channel) => {
  await GuildChannelSyncService.createChannel(channel);
  logger.debug(`Added channel ${channel.name}`);
});

client.on("channelUpdate", async (channel) => {
  await GuildChannelSyncService.updateChannel(channel as GuildChannel);
  logger.debug(`Updated channel ${channel.id}`);
});

client.on("channelDelete", async (channel) => {
  await GuildChannelSyncService.createChannel(channel as GuildChannel);
  logger.debug(`De channel ${channel.id}`);
});

/** */

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
  await GuildRoleSyncService.syncRoles(guild);
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
