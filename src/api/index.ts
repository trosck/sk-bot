import express from "express";
import { getUserById, getUsers, giveUserXP } from "./users.js";
import {
  getChannels,
  getPromoCatChannel,
  setPromoCatChannel,
} from "./channels.js";
import {
  createScheduledPost,
  getScheduledPostById,
  getScheduledPosts,
} from "./scheduled-posts.js";
import multer from "multer";
import { uploadPromoCatPromocodes } from "./promocats.js";

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
apiRouter.get("/channels/promo-cat/", getPromoCatChannel);
apiRouter.post("/channels/promo-cat/:id", setPromoCatChannel);

/** Scheduled posts */
apiRouter.get("/scheduled-posts", getScheduledPosts);
apiRouter.post("/scheduled-posts", createScheduledPost);
apiRouter.get("/scheduled-posts/:id", getScheduledPostById);

/** PromoCats */
apiRouter.post(
  "/promo-cats/upload/promocodes",
  upload.single("file"),
  uploadPromoCatPromocodes
);

export { apiRouter };
