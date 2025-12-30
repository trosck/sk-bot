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

export async function createScheduledPost(req: Request, res: Response) {
  const { channel_id, scheduled_at, text } = req.body;

  const post = await prisma.scheduledPost.create({
    data: {
      channel_id,
      scheduled_at,
      text,
    },
  });

  if (req.file) {
    await uploadScheduledPostImage(post.id, req.file);
  }

  return res.json({});
}

async function deleteScheduledPostImage(postId: number) {
  const image = await prisma.scheduledPostImage.findFirst({
    where: {
      scheduledPostId: postId,
    },
  });

  if (!image) {
    return;
  }

  await prisma.scheduledPostImage.delete({
    where: {
      id: image.id,
    },
  });
}

export async function updateScheduledPost(req: Request, res: Response) {
  const postId = parseInt(req.params.id);

  if (!postId) {
    return res.status(400).json({ error: "no post id" });
  }

  if (req.body.media === "") {
    await deleteScheduledPostImage(postId);
  }

  if (req.file) {
    await deleteScheduledPostImage(postId);
    await uploadScheduledPostImage(postId, req.file);
  }

  await prisma.scheduledPost.update({
    data: req.body,
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
