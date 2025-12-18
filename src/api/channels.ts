import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import z from "zod";

export async function getChannels(req: Request, res: Response) {
  const querySchema = z.object({
    type: z.coerce.number().int().optional(),
  });

  const queryParsed = querySchema.safeParse(req.query);
  if (!queryParsed.success) {
    return res.status(400).json({ error: queryParsed.error.cause });
  }

  const channels = await prisma.channel.findMany({
    where: {
      type: queryParsed.data.type,
    },
  });

  return res.json(channels);
}

export async function getPromoCatChannel(req: Request, res: Response) {
  const config = await prisma.appConfig.findFirst();

  const promocatsChannelId = config?.promocats_channel_id;
  if (!promocatsChannelId) {
    return res.json();
  }

  const channel = await prisma.channel.findFirst({
    where: {
      id: promocatsChannelId,
    },
  });

  return res.json(channel);
}

export async function setPromoCatChannel(req: Request, res: Response) {
  await prisma.appConfig.updateMany({
    data: {
      promocats_channel_id: String(req.params.id),
    },
  });

  return res.json();
}
