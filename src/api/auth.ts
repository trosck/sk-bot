import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET_ACCESS, JWT_SECRET_REFRESH, NODE_ENV } from "../config.js";
import { AppConfigService } from "../services/app-config.service.js";

function getAccessToken() {
  return jwt.sign({ username: "admin" }, JWT_SECRET_ACCESS, {
    expiresIn: "15m",
  });
}

function getRefreshToken() {
  return jwt.sign({ username: "admin" }, JWT_SECRET_REFRESH, {
    expiresIn: "30d",
  });
}

export async function login(req: Request, res: Response) {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "No password 😠" });
  }

  const config = await AppConfigService.getAppConfig();

  const adminPassword = config?.admin_password;
  if (!adminPassword) {
    return res.status(400).json({ error: "No admin password 🤯" });
  }

  const isPasswordValid = await bcrypt.compare(password, adminPassword);
  if (!isPasswordValid) {
    return res.status(400).json({ error: "Invalid credentials 😞" });
  }

  const refreshToken = getRefreshToken();

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.json({ access_token: getAccessToken() });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refresh_token;
  if (!token) {
    return res.status(401).json({ error: "No refresh token 🫥" });
  }

  try {
    jwt.verify(token, JWT_SECRET_REFRESH);
  } catch (e) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  return res.json({ access_token: getAccessToken() });
}
