import type { ApplicationCommand, ApplicationCommandOption } from "discord.js";
import type { Request, Response, NextFunction } from "express";
import { InteractionResponseType, InteractionType } from "discord-interactions";

import { UserCommandHandler } from "./commands/index.js";
import { logger } from "../logger.js";

const defineCommand = <T extends ApplicationCommandOption>(cmd: T) => cmd;

export const DiscordCommandList = [
  defineCommand({
    name: "test",
    description: "Basic commandowez",
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  } as const),

  defineCommand({
    name: "test2",
    description: "Basic commandi",
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  } as const),

  defineCommand({
    name: "stat",
    description: "Show me my stats",
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  } as const),
] as const;

export type CommandName = (typeof DiscordCommandList)[number]["name"];

export default async function handleDiscordInteractions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { type } = req.body;

  if (type === InteractionType.PING) {
    logger.info("PING", req.body);
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    try {
      await UserCommandHandler({
        command: req.body.data as ApplicationCommand,
        data: req.body,
        req,
        res,
      });
    } catch (e) {
      res.status(400).json({ error: "unknown command" });
    }
  }
}
