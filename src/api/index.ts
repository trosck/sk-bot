import express from "express";
import multer from "multer";

import { getUserById, getUsers, giveUserXP } from "./users.js";
import { getChannels } from "./channels.js";
import {
  createScheduledPost,
  getScheduledPostById,
  getScheduledPosts,
} from "./scheduled-posts.js";
import {
  getPromoCats,
  getPromoCatsSettings,
  setPromoCatsSettings,
  uploadPromoCatPromocodes,
} from "./promo-cats.js";

const apiRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    //        MB
    fileSize: 20 * 1024 * 1024,
  },
});

/** Users */
apiRouter.get("/users", getUsers);
apiRouter.get("/users/:id", getUserById);
apiRouter.post("/users/:id/give-xp", giveUserXP);

/** Channels */
apiRouter.get("/channels", getChannels);

/** Scheduled posts */
apiRouter.get("/scheduled-posts", getScheduledPosts);
apiRouter.post("/scheduled-posts", createScheduledPost);
apiRouter.get("/scheduled-posts/:id", getScheduledPostById);

/** PromoCats */
apiRouter.get("/promo-cats", getPromoCats);
apiRouter.get("/promo-cats/settings", getPromoCatsSettings);
apiRouter.post("/promo-cats/settings", setPromoCatsSettings);
apiRouter.post(
  "/promo-cats/upload/promocodes",
  upload.single("file"),
  uploadPromoCatPromocodes
);

export { apiRouter };
