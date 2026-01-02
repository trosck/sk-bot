import { Request, Response } from "express";
import unzipper from "unzipper";
import xlsx from "xlsx";

import { mkdir, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import crypto from "node:crypto";
import path from "node:path";

import { prisma } from "../prisma.js";
import {
  createPaginatedQuery,
  sendPaginatedResponse,
} from "../helpers/create-paginated-query.js";
import { makePreview } from "../utils/make-preview.js";
import { Prisma } from "../../generated/prisma/client.js";
import { IMAGES_DIR } from "../config.js";
import { IMAGE_FORMATS } from "../constants.js";
import { getAppConfig } from "../cache/app-config.cache.js";

export const PROMOCAT_IMAGES_DIR = path.join(IMAGES_DIR, "promocats");

export async function getPromoCatsSettings(req: Request, res: Response) {
  const config = await getAppConfig();

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

export async function getPromoCatImages(req: Request, res: Response) {
  const previews = await prisma.promoCatImage.findMany();

  return res.json(previews);
}

export async function uploadPromoCatImages(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: "No file🤨" });
  }

  await mkdir(PROMOCAT_IMAGES_DIR, { recursive: true });

  const fileBuffer = req.file.buffer;
  const previews: Prisma.PromoCatImageModel[] = [];

  await new Promise((resolve, reject) => {
    const tasks: Promise<void>[] = [];

    Readable.from(fileBuffer)
      .pipe(unzipper.Parse())
      .on("entry", async (entry) => {
        if (entry.type !== "File") {
          return entry.autodrain();
        }

        const task = (async () => {
          const origName = entry.path || "";
          const ext = path.extname(origName) || "";

          if (!IMAGE_FORMATS.has(ext)) {
            return entry.autodrain();
          }

          const name = `${crypto.randomUUID()}${ext}`;
          const buf = await entry.buffer();

          let preview: Buffer;
          try {
            preview = await makePreview(buf);
          } catch (e) {
            // bad/corrupt image, skip
            return;
          }

          previews.push({
            name: path.basename(name),
            preview: Buffer.from(preview),
          });

          await writeFile(path.join(PROMOCAT_IMAGES_DIR, name), buf);
        })().catch(reject);

        tasks.push(task);
      })
      .on("close", () => {
        Promise.all(tasks).then(resolve).catch(reject);
      })
      .on("error", reject);
  });

  await prisma.promoCatImage.createMany({
    data: previews,
    skipDuplicates: true,
  });

  return res.json({});
}

export async function uploadPromoCatPromocodes(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: "No file🙁" });
  }

  const workbook = xlsx.read(req.file.buffer, {
    type: "buffer",
    cellDates: true,
  });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return res.status(400).json({ error: "No data🤨" });
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
