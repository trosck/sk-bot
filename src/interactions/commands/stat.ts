import { prisma } from "../../prisma.js";
import type { InteractionHandler } from "./index.js";
import {
  InteractionResponseFlags,
  InteractionResponseType,
  MessageComponentTypes,
} from "discord-interactions";

const stat: InteractionHandler = async (data, req, res) => {
  const userId = data.member?.user.id;

  let content = "ничиво нету";
  if (userId) {
    const stats = await prisma.user.findFirst({
      select: {
        total_xp: true,
        level: true,
        cookies: true,
      },
      where: {
        discord_id: userId,
      },
    });

    if (stats) {
      content = `
Уровень: ${stats.level}
Опыт: ${stats.total_xp}
Печеньки: ${stats.cookies}`;
    }
  }

  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.TEXT_DISPLAY,
          content: content,
        },
      ],
    },
  });
};

export { stat };
