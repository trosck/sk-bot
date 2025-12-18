import {
  InteractionResponseFlags,
  InteractionResponseType,
  MessageComponentTypes,
} from "discord-interactions";
import type { InteractionHandler } from "./index.js";
import OpenAI from "openai";
import { logger } from "../../logger.js";
import { DiscordRequest } from "../../request.js";
import { Routes } from "discord.js";
import { APP_ID } from "../../config.js";

const chatbot = new OpenAI.OpenAI({
  baseURL: "https://api.llm7.io/v1",
  apiKey: "unused",
});

const test: InteractionHandler = async (data, req, res) => {
  logger.debug({ data });
  const respo = await DiscordRequest.post(
    Routes.interactionCallback(data.id, data.token),
    {
      body: {
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      },
    }
  );

  logger.debug("asdf");
  let content = "";

  logger.debug("a oa ooo a oa");

  try {
    logger.debug("asd1212f");
    const aiResponse = await chatbot.chat.completions.create({
      messages: [
        {
          role: "user",
          content:
            "расскажи случайный анекдот про stalker. в ответ включи только анекдот и ничего больше.",
        },
      ],
      model: "chatgpt-4o-latest",
    });

    logger.debug(231231);

    content = aiResponse.choices[0]?.message.content ?? "";
  } catch (err) {
    logger.debug(err);
    logger.error(err);
  }

  logger.debug({ content });

  await DiscordRequest.patch(Routes.webhookMessage(APP_ID, data.token), {
    body: {
      content: content,
    },
  });

  return res;
};

export { test };
