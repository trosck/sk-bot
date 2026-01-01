import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { UserXpReward } from "../RewardSystem/UserXpReward.js";
import {
  createPaginatedQuery,
  sendPaginatedResponse,
} from "../helpers/create-paginated-query.js";

export async function giveUserXP(req: Request, res: Response) {
  const user = await prisma.user.findFirst({
    where: {
      id: Number(req.params.id),
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
      id: true,
      discord_id: true,
      username: true,
      roles: true,
      total_xp: true,
      level: true,
      cookies: true,
      avatar: true,
    },
    where: {
      discord_id: req.params.id,
    },
  });

  return res.json(user);
}

export async function getUsers(req: Request, res: Response) {
  const { data, limit } = createPaginatedQuery(
    req,
    {
      discord_id: true,
      id: true,
      username: true,
      roles: true,
      total_xp: true,
      level: true,
      cookies: true,
      avatar: true,
    },
    {
      id: "asc",
    }
  );

  const search = req.query.search as string;
  if (search) {
    data.where = {
      OR: [
        { username: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const total = await prisma.user.count();
  const users = await prisma.user.findMany(data);

  return sendPaginatedResponse(res, users, total, limit);
}
