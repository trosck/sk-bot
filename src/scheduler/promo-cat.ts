/**
"Meow!
It’s a new day – a new special promocat for you!"

Promocode: ASFK8LLE23LH
Use Promo - Bonus 7%
 */

import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import { client } from "../gateway/index.js";
import { logger } from "../logger.js";
import { prisma } from "../prisma.js";
import path from "path";
import { PROMOCAT_IMAGES_DIR } from "../api/promo-cats.js";
import { rm } from "fs/promises";

function isItTimeToPost(postTime: Date, nowTime: Date) {
  const isHoursSame = postTime.getHours() === nowTime.getHours();

  const minutesDifference = postTime.getMinutes() - nowTime.getMinutes();

  const isMinutesWithinRange = minutesDifference > 0 && minutesDifference <= 1;

  return isHoursSame && isMinutesWithinRange;
}

export async function schedulePromoCat() {
  const config = await prisma.appConfig.findFirst();

  if (!config?.promocats_post_time) return;
  if (!config?.promocats_channel_id) return;

  const postTime = new Date(config.promocats_post_time);
  const nowTime = new Date();
  nowTime.setMinutes(nowTime.getMinutes() + 1);

  const lastPosted = config.promocats_last_posted;
  if (lastPosted) {
    const lastPostedDate = new Date(lastPosted);

    if (lastPostedDate.getDate() === nowTime.getDate()) {
      return;
    }
  }

  const itsTimeToPost = isItTimeToPost(postTime, nowTime);

  if (!itsTimeToPost) {
    return;
  }

  const promocatDate = new Date(nowTime);
  promocatDate.setHours(0);
  promocatDate.setMinutes(0);
  promocatDate.setSeconds(0);
  promocatDate.setMilliseconds(0);

  const promocat = await prisma.promoCat.findFirst({
    where: {
      date: {
        equals: promocatDate,
      },
    },
  });

  if (!promocat) {
    return logger.error("no promocat for today");
  }

  const channel = await client.channels.fetch(config.promocats_channel_id);

  if (!channel) {
    return logger.error("no such channel: " + config.promocats_channel_id);
  }

  if (!channel.isSendable()) {
    return logger.error("can't post to this channel");
  }

  const promocatImage = await prisma.promoCatImage.findFirst();
  if (!promocatImage) {
    return logger.error("no image for posting promocat :(");
  }

  const link = `https://skin.club/en?utm_promo=${
    promocat.promocode
  }&utm_source=discord&utm_medium=promocats&utm_campaign=post${nowTime.getDate()}${
    nowTime.getMonth() + 1
  }${nowTime.getFullYear()}`;

  const linkEmbed = new EmbedBuilder().setTitle("Use promocode").setURL(link);

  const imagePath = path.join(PROMOCAT_IMAGES_DIR, promocatImage.name);
  const imageAttachment = new AttachmentBuilder(imagePath);

  await channel.send({
    content: [
      '"Meow!',
      'It’s a new day – a new special promocat for you!"',
      "",
      `Promocode: **VP2LUKP9QRQW**`,
      `Bonus **${promocat.discount}%**`,
      "",
    ].join("\n"),
    embeds: [linkEmbed],
    files: [imageAttachment],
  });

  await prisma.appConfig.updateMany({
    data: {
      promocats_last_posted: new Date(),
    },
  });

  await prisma.promoCat.delete({
    where: {
      id: promocat.id,
    },
  });

  await prisma.promoCatImage.delete({
    where: {
      name: promocatImage.name,
    },
  });

  await rm(imagePath);

  logger.info("Promocat posted");
}
