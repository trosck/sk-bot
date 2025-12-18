import { Request, Response } from "express";
import { prisma } from "../prisma.js";

export async function createScheduledPost(req: Request, res: Response) {
  const { channel_id, media, scheduled_at, text } = req.body;

  await prisma.scheduledPost.create({
    data: {
      channel_id,
      media: [media],
      scheduled_at,
      text,
    },
  });

  return res.json({});
}

export async function getScheduledPostById(req: Request, res: Response) {
  const post = await prisma.scheduledPost.findFirst({
    select: {
      id: true,
      channel_id: true,
      text: true,
      media: true,
      status: true,
      error: true,
      scheduled_at: true,
    },
    where: {
      id: Number(req.params.id),
    },
  });

  return res.json(post);
}

export async function getScheduledPosts(req: Request, res: Response) {
  const { limit, order, sort, cursor } = req.query;

  const _limit = parseInt(limit as string) || 10;

  const data: any = {
    select: {
      id: true,
      channel_id: true,
      text: true,
      media: true,
      status: true,
      error: true,
      scheduled_at: true,
    },
    take: _limit,
    orderBy: [
      {
        created_at: "asc",
      },
    ],
  };

  if (sort) {
    data.orderBy.unshift({
      [sort as string]: order || "asc",
    });
  }

  if (cursor) {
    data.skip = 1;
    data.cursor = {
      id: +cursor,
    };
  }

  const total = await prisma.scheduledPost.count();

  const posts = await prisma.scheduledPost.findMany(data);

  let nextCursor = null;
  if (posts.length >= _limit) {
    nextCursor = posts.at(-1)?.id;
  }

  return res.json({
    data: posts,
    nextCursor,
    total,
  });
}
