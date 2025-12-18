import { Request, Response } from "express";
import xlsx from "xlsx";
import { prisma } from "../prisma.js";
import {
  createPaginatedQuery,
  sendPaginatedResponse,
} from "../helpers/create-paginated-query.js";

export async function getPromoCatsSettings(req: Request, res: Response) {
  const config = await prisma.appConfig.findFirst();

  return res.json({
    channel_id: config?.promocats_channel_id ?? null,
    post_time: config?.promocats_post_time ?? null,
  });
}

export async function setPromoCatsSettings(req: Request, res: Response) {
  const { channel_id, post_time } = req.body;

  await prisma.appConfig.updateMany({
    data: {
      promocats_channel_id: channel_id ?? undefined,
      promocats_post_time: post_time ?? undefined,
    },
  });

  return res.json({});
}

export async function uploadPromoCatPromocodes(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: "No file🤨" });
  }

  const workbook = xlsx.read(req.file.buffer, {
    type: "buffer",
    cellDates: true,
  });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return res.status(400).json({ error: "No data🙁" });
  }

  const sheet = workbook.Sheets[firstSheetName];

  const rows = xlsx.utils.sheet_to_json(sheet, {
    header: 1,
    // defval: null, // пустые ячейки -> null
    blankrows: false,
    raw: false,
  });

  if (!rows.length) {
    return res.status(400).json({ error: "Epmty sheet😔" });
  }

  const dataRows = rows.slice(1) as [string, string, string][];

  const promocodes = [];
  for (const row of dataRows) {
    const discount = parseInt(row[0]);
    const promocode = row[1];
    const dateRaw = row[2].split("/");
    const date = new Date(
      parseInt("20" + dateRaw[2]),
      parseInt(dateRaw[0]) - 1,
      parseInt(dateRaw[1])
    );

    promocodes.push({
      promocode,
      discount,
      date,
    });
  }

  await prisma.promoCat.createMany({
    data: promocodes,
    skipDuplicates: true,
  });

  return res.json({});
}

export async function getPromoCats(req: Request, res: Response) {
  const { data, limit } = createPaginatedQuery(
    req,
    {
      id: true,
      promocode: true,
      discount: true,
      date: true,
    },
    { date: "asc" }
  );

  const total = await prisma.promoCat.count();
  const promocodes = await prisma.promoCat.findMany(data);

  return sendPaginatedResponse(res, promocodes, total, limit);
}
