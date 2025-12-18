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
