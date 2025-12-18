import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import {
  createPaginatedQuery,
  sendPaginatedResponse,
} from "../helpers/create-paginated-query.js";

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
  const { data, limit } = createPaginatedQuery(
    req,
    {
      id: true,
      channel_id: true,
      text: true,
      media: true,
      status: true,
      error: true,
      scheduled_at: true,
    },
    {
      created_at: "asc",
    }
  );

  const total = await prisma.user.count();
  const posts = await prisma.scheduledPost.findMany(data);

  return sendPaginatedResponse(res, posts, total, limit);
}
