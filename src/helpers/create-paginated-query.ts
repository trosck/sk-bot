import { Request, Response } from "express";

interface PaginationOptions {
  defaultLimit?: number;
  defaultOrder?: "asc" | "desc";
}

interface PaginationParams {
  limit?: string;
  order?: string;
  sort?: string;
  cursor?: string;
}

export function createPaginatedQuery(
  req: Request,
  select: Record<string, boolean>,
  defaultOrderBy: Record<string, "asc" | "desc">,
  options: PaginationOptions = {}
) {
  const { limit, order, sort, cursor } = req.query as PaginationParams;

  const _limit = parseInt(limit as string) || options.defaultLimit || 10;

  const data: any = {
    select,
    take: _limit,
    orderBy: [defaultOrderBy],
  };

  if (sort) {
    data.orderBy.unshift({
      [sort]: order || options.defaultOrder || "asc",
    });
  }

  if (cursor) {
    data.skip = 1;
    data.cursor = {
      id: isNaN(+cursor) ? cursor : +cursor,
    };
  }

  return { data, limit: _limit };
}

export async function sendPaginatedResponse<T extends { id: number | string }>(
  res: Response,
  items: T[],
  total: number,
  limit: number
) {
  let nextCursor = null;
  if (items.length >= limit) {
    nextCursor = items.at(-1)?.id;
  }

  return res.json({
    data: items,
    nextCursor,
    total,
  });
}
