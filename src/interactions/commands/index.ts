import type { Request, Response } from "express";
import type { ApplicationCommand, Interaction } from "discord.js";

import {
  InteractionResponseFlags,
  InteractionResponseType,
  MessageComponentTypes,
} from "discord-interactions";
import { stat } from "./stat.js";
import { test } from "./test.js";
import { CommandName } from "../index.js";

export type InteractionHandler = (
  data: Interaction,
  req: Request,
  res: Response
) => Promise<Response>;

const handlers: Record<CommandName, InteractionHandler> = {
  test: test,
  stat: stat,
  test2: async (data: Interaction, req: Request, res: Response) => {
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [
          {
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
          },
        ],
      },
    });
  },
};

export async function UserCommandHandler({
  data,
  command,
  req,
  res,
}: {
  data: Interaction;
  command: ApplicationCommand;
  req: Request;
  res: Response;
}) {
  const methodName = command.name as CommandName;

  const hasMethod = Object.hasOwn(handlers, methodName);
  if (!hasMethod) {
    throw new Error(`unknown command: ${methodName}`);
  }

  return; //handlers[methodName](data, req, res);
}
