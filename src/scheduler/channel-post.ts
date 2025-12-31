import { AttachmentBuilder } from "discord.js";
import { client } from "../gateway/index.js";
import { logger } from "../logger.js";
import { prisma } from "../prisma.js";
import path from "node:path";
import { IMAGES_DIR } from "../config.js";
import { withRetry } from "../utils/with-retry.js";

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
      if (!channel?.isSendable()) {
        await prisma.scheduledPost.update({
          where: {
            id: post.id,
          },
          data: {
            status: "FAILED",
            error: "Can't write to this channel",
          },
        });

        return logger.error("cant send to this channel");
      }

      const postData: any = {
        content: post.text,
      };

      logger.info("Before media");

      if (post.media?.length) {
        const media = post.media[0];
        const imageAttachment = new AttachmentBuilder(
          path.join(IMAGES_DIR, media.path),
          {
            name: media.path,
          }
        );

        postData.files = [imageAttachment];
      }

      logger.info("Before send");

      await withRetry(() => channel.send(postData));

      await prisma.scheduledPost.update({
        where: {
          id: post.id,
        },
        data: {
          status: "SENT",
        },
      });

      logger.info(
        `Sent post ID${post.id} [${post.scheduled_at}] ${post.channel_id}`
      );
    } catch (error) {
      logger.error(
        `Error sending post [${post.scheduled_at}] ${post.channel_id}`
      );
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
