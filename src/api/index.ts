import express from "express";
import multer from "multer";

import { getUserById, getUsers, giveUserXP } from "./users.js";
import { getChannels } from "./channels.js";
import {
  createScheduledPost,
  deleteScheduledPost,
  getScheduledPostById,
  getScheduledPosts,
  updateScheduledPost,
} from "./scheduled-posts.js";
import {
  getPromoCatImages,
  getPromoCats,
  getPromoCatsSettings,
  setPromoCatsSettings,
  uploadPromoCatImages,
  uploadPromoCatPromocodes,
} from "./promo-cats.js";
import { login, refresh } from "./auth.js";
import { authMiddleware } from "../middleware.js";

const apiRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
    //        ^ Mb ^ 1Mb  ^ 1Kb
  },
});

/** Auth */
apiRouter.post("/login", login);
apiRouter.post("/refresh", refresh);

// apiRouter.use(authMiddleware);

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
apiRouter.delete("/scheduled-posts/:id", deleteScheduledPost);
apiRouter.patch("/scheduled-posts/:id", updateScheduledPost);

/** PromoCats */
apiRouter.get("/promo-cats", getPromoCats);
apiRouter.get("/promo-cats/settings", getPromoCatsSettings);
apiRouter.post("/promo-cats/settings", setPromoCatsSettings);
apiRouter.post(
  "/promo-cats/upload/promocodes",
  upload.single("file"),
  uploadPromoCatPromocodes
);
apiRouter.get("/promo-cats/upload/images", getPromoCatImages);
apiRouter.post(
  "/promo-cats/upload/images",
  upload.single("file"),
  uploadPromoCatImages
);

export { apiRouter };
