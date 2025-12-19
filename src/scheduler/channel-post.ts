import { client } from "../gateway/index.js";
import { logger } from "../logger.js";
import { prisma } from "../prisma.js";

/**
 * запрашивать время отложенного поста
 * и делать таймер на это время
 *
 * опрос раз в 5 минут
 *
 * взяли пост - поставили статус PROCESSING - поставили таймер
 *
 * при запуске приложения всем постам со статусом PROCESSING
 * ставить статус SCHEDULED т.к. это значит приложение упало
 * во время обработки. либо ставить таймер на постинг/постить
 * сразу
 */

export async function scheduleChannelPost() {
  const posts = await prisma.scheduledPost.findMany({
    select: {
      id: true,
      channel_id: true,
      text: true,
      media: true,
      scheduled_at: true,
    },
    where: {
      status: "SCHEDULED",
      scheduled_at: {
        lte: new Date(),
      },
    },
  });

  logger.debug(`${posts.length} scheduled posts`);

  for (const post of posts) {
    try {
      await prisma.scheduledPost.update({
        where: {
          id: post.id,
        },
        data: {
          status: "PROCESSING",
        },
      });

      const channel = await client.channels.fetch(post.channel_id);
      if (channel?.isSendable()) {
        await channel.send({
          content: post.text,
          embeds: [
            {
              title: "title?",
              description: "description",
              footer: {
                text: "footer",
              },
              image: {
                url: "https://hips.hearstapps.com/hmg-prod/images/ginger-maine-coon-kitten-running-on-lawn-in-royalty-free-image-1719608142.jpg",
              },
              url: "https://hips.hearstapps.com/hmg-prod/images/ginger-maine-coon-kitten-running-on-lawn-in-royalty-free-image-1719608142.jpg",
            },
          ],
        });
      }

      await prisma.scheduledPost.update({
        where: {
          id: post.id,
        },
        data: {
          status: "SENT",
        },
      });

      logger.info(`Sent "${post.id}" post`);
    } catch (error) {
      await prisma.scheduledPost.update({
        where: {
          id: post.id,
        },
        data: {
          status: "FAILED",
          error: error?.toString() ?? "unknow error",
        },
      });
    }
  }
}
