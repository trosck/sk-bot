import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { UserXpReward } from "../RewardSystem/UserXpReward.js";

export async function giveUserXP(req: Request, res: Response) {
  const user = await prisma.user.findFirst({
    where: {
      user_id: Number(req.params.id),
    },
  });

  if (!user) {
    return res.status(404).json({});
  }

  await UserXpReward.rewardUser(user, Number(req.body.xp));

  return res.json(user);
}

export async function getUserById(req: Request, res: Response) {
  const user = await prisma.user.findFirst({
    select: {
      discord_user_id: true,
      user_id: true,
      username: true,
      roles: true,
      total_xp: true,
      level: true,
      cookies: true,
      avatar: true,
    },
    where: {
      discord_user_id: req.params.id,
    },
  });

  return res.json(user);
}

export async function getUsers(req: Request, res: Response) {
  const { limit, order, sort, cursor } = req.query;

  const _limit = parseInt(limit as string) || 10;

  const data: any = {
    select: {
      discord_user_id: true,
      user_id: true,
      username: true,
      roles: true,
      total_xp: true,
      level: true,
      cookies: true,
      avatar: true,
    },
    take: _limit,
    orderBy: [
      {
        user_id: "asc",
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
      user_id: +cursor,
    };
  }

  const total = await prisma.user.count();

  const users = await prisma.user.findMany(data);

  let nextCursor = null;
  if (users.length >= _limit) {
    nextCursor = users.at(-1)?.user_id;
  }

  return res.json({
    data: users,
    nextCursor,
    total,
  });
}
