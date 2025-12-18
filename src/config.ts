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

export const APP_ID = requireEnv("APP_ID");
export const DISCORD_TOKEN = requireEnv("DISCORD_TOKEN");
export const PUBLIC_KEY = requireEnv("PUBLIC_KEY");
export const NODE_ENV = requireEnv("NODE_ENV", "production");
export const LOG_LEVEL = requireEnv("LOG_LEVEL", "info");
