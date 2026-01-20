import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import {
  createPaginatedQuery,
  sendPaginatedResponse,
} from "../helpers/create-paginated-query.js";
import { mkdir, writeFile } from "node:fs/promises";
import { IMAGES_DIR } from "../config.js";
import path from "node:path";
import { makePreview } from "../utils/make-preview.js";
import { IMAGE_FORMATS } from "../constants.js";
import { ScheduledPostModel } from "../../generated/prisma/models.js";

export async function createScheduledPost(req: Request, res: Response) {
  const { channel_id, scheduled_at, text } = req.body;

  const post = await prisma.scheduledPost.create({
    data: {
      channel_id,
      scheduled_at,
      text,
    },
  });

  if (req.files?.length) {
    const files = req.files as Express.Multer.File[]

    for (const file of files) {
      await uploadScheduledPostImage(post.id, file);
    }
  }

  return res.json({});
}

async function deleteScheduledPostImagesByIds(mediaIds: number[]) {
  return await prisma.scheduledPostImage.deleteMany({
    where: {
      id: { in: mediaIds },
    },
  });
}

export async function updateScheduledPost(req: Request, res: Response) {
  const postId = parseInt(req.params.id);

  if (!postId) {
    return res.status(400).json({ error: "no post id" });
  }

  const postData: Partial<ScheduledPostModel> = {
    text: req.body.text,
    scheduled_at: req.body.scheduled_at,
    channel_id: req.body.channel_id,
  };

  if (req.body.removed_media_ids) {
    await deleteScheduledPostImagesByIds(req.body.removed_media_ids.split(",").map(Number));
  }

  if (req.files?.length) {
    const files = req.files as Express.Multer.File[]

    for (const file of files) {
      await uploadScheduledPostImage(postId, file);
    }
  }

  await prisma.scheduledPost.update({
    data: postData,
    where: {
      id: postId,
    },
  });

  return res.json({});
}

export async function deleteScheduledPost(req: Request, res: Response) {
  const postId = req.params.id;

  if (!postId) {
    return res.status(400).json({ error: "no post id" });
  }

  await prisma.scheduledPost.delete({
    where: {
      id: parseInt(postId),
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

async function uploadScheduledPostImage(
  postId: number,
  file: Express.Multer.File
) {
  await mkdir(IMAGES_DIR, { recursive: true });

  const origName = file.originalname || "";
  const ext = (path.extname(origName) || "").toLowerCase();

  if (!IMAGE_FORMATS.has(ext)) {
    return;
  }

  const name = `${crypto.randomUUID()}${ext}`;
  const buf = file.buffer;

  const preview = await makePreview(buf);

  await writeFile(path.join(IMAGES_DIR, name), buf);

  await prisma.scheduledPostImage.create({
    data: {
      preview: Buffer.from(preview),
      path: path.basename(name),
      scheduledPostId: postId,
    },
  });
}
