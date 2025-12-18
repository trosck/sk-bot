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

const apiRouter = express.Router();

apiRouter.get("/users", getUsers);
apiRouter.get("/users/:id", getUserById);
apiRouter.post("/users/:id/give-xp", giveUserXP);

apiRouter.get("/channels", getChannels);
apiRouter.get("/channels/promo-cat/", getPromoCatChannel);
apiRouter.post("/channels/promo-cat/:id", setPromoCatChannel);

apiRouter.get("/scheduled-posts", getScheduledPosts);
apiRouter.post("/scheduled-posts", createScheduledPost);
apiRouter.get("/scheduled-posts/:id", getScheduledPostById);

export { apiRouter };
