import "dotenv/config";

function requireEnv(name: string, defaultValue?: string): string {
  const value = process.env[name] as string;

  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  if (!value && defaultValue) {
    return defaultValue;
  }

  return value;
}

export const NODE_ENV = requireEnv("NODE_ENV", "production");
export const LOG_LEVEL = requireEnv("LOG_LEVEL", "info");
export const FRONTEND_URL = requireEnv("FRONTEND_URL");

export const JWT_SECRET_ACCESS = requireEnv("JWT_SECRET_ACCESS");
export const JWT_SECRET_REFRESH = requireEnv("JWT_SECRET_REFRESH");

export const IMAGES_DIR = requireEnv("IMAGES_DIR");
export const PUBLIC_KEY = requireEnv("PUBLIC_KEY");

export const APP_ID = requireEnv("APP_ID");
export const DISCORD_TOKEN = requireEnv("DISCORD_TOKEN");

export const DISCORD_CLIENT_ID = requireEnv("DISCORD_CLIENT_ID");
export const DISCORD_CLIENT_SECRET = requireEnv("DISCORD_CLIENT_SECRET");
export const DISCORD_REDIRECT_URI = requireEnv("DISCORD_REDIRECT_URI");

export const isDev = NODE_ENV === "development";
export const isProd = NODE_ENV === "production";
