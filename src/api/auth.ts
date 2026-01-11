import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, FRONTEND_URL, isProd, JWT_SECRET_ACCESS, JWT_SECRET_REFRESH } from "../config.js";
import { AppConfigService } from "../services/app-config.service.js";
import { APIGuild, User } from "discord.js";
import { GuildMemberSyncService } from "../services/guild-member-sync.service.js";

function getAccessToken(id: string) {
  return jwt.sign({ id }, JWT_SECRET_ACCESS, {
    expiresIn: "15m",
  });
}

function getRefreshToken(id: string) {
  return jwt.sign({ id }, JWT_SECRET_REFRESH, {
    expiresIn: "30d",
  });
}

function setTokens(res: Response, accessToken: string, refreshToken: string) {
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProd,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProd,
    maxAge: 15 * 60 * 1000,
  });
}

export async function getMe(req: Request, res: Response) {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({ error: "No access token 🫥" });
  }

  try {
    jwt.verify(token, JWT_SECRET_ACCESS);
  } catch (e) {
    return res.status(401).json({ error: "Invalid access token" });
  }

  return res.json({});
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("refresh_token");
  res.clearCookie("access_token");
  return res.json({});
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

  setTokens(res, getAccessToken("admin"), getRefreshToken("admin"));

  return res.json({});
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refresh_token;
  if (!token) {
    return res.status(401).json({ error: "No refresh token 🫥" });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET_REFRESH);
  } catch (e) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  setTokens(res, getAccessToken(decoded.username), getRefreshToken(decoded.username));

  return res.json({});
}

export async function discordLogin(req: Request, res: Response) {
  const state = crypto.randomUUID();

  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: isProd,
    maxAge: 15 * 60 * 1000
  });

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify guilds",
    state: state,
  });

  res.redirect(
    `https://discord.com/oauth2/authorize?${params.toString()}`
  );
}

export async function discordCallback(req: Request, res: Response) {
  const { code, state } = req.query;

  const savedState = req.cookies.oauth_state;

  if (!code || !state || savedState !== state) {
    return res.status(400).json({ error: "No code provided or invalid state" });
  }

  res.clearCookie("oauth_state");

  try {
    const tokenRes = await fetch(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          redirect_uri: DISCORD_REDIRECT_URI,
          grant_type: "authorization_code",
          code: code as string,
        })
      }
    );

    if (!tokenRes.ok) {
      return res.status(400).json({ error: "Failed to get token" });
    }

    const tokenData = await tokenRes.json();

    const userRes = await fetch(
      "https://discord.com/api/users/@me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!userRes.ok) {
      return res.status(400).json({ error: "Failed to get user" });
    }

    const userData: User = await userRes.json();

    const guildsRes = await fetch(
      "https://discord.com/api/users/@me/guilds",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!guildsRes.ok) {
      return res.status(400).json({ error: "Failed to get user guilds" });
    }

    const guildsData: APIGuild[] = await guildsRes.json();

    const appConfig = await AppConfigService.getAppConfig();

    const isInGuild = guildsData.some((guild) => appConfig.guild_id === guild.id);

    if (!isInGuild) {
      return res.status(400).json({ error: "User is not in the guild" });
    }

    const user = await GuildMemberSyncService.getUser(userData.id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const hasAccessRole = appConfig.access_roles.some((role) => user.roles.includes(role));
    if (!hasAccessRole) {
      return res.status(400).json({ error: "User does not have access role" });
    }

    const accessToken = getAccessToken(userData.id);
    const refreshToken = getRefreshToken(userData.id);

    setTokens(res, accessToken, refreshToken);

    return res.redirect(FRONTEND_URL);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
