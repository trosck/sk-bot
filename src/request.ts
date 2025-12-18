import { REST, type RequestData } from "discord.js";
import { DISCORD_TOKEN } from "./config.js";

// https://discord.com/developers/docs/reference#api-versioning-api-versions
const DiscordApiVersion = "10";

class TypedREST {
  constructor(private readonly rest: REST) {}

  async get<T = unknown>(route: any, options?: RequestData): Promise<T> {
    return this.rest.get(route, options) as Promise<T>;
  }

  async post<T = unknown>(route: any, options?: RequestData): Promise<T> {
    return this.rest.post(route, options) as Promise<T>;
  }

  async put<T = unknown>(route: any, options?: RequestData): Promise<T> {
    return this.rest.put(route, options) as Promise<T>;
  }

  async patch<T = unknown>(route: any, options?: RequestData): Promise<T> {
    return this.rest.patch(route, options) as Promise<T>;
  }

  async delete<T = unknown>(route: any, options?: RequestData): Promise<T> {
    return this.rest.delete(route, options) as Promise<T>;
  }
}

const client = new REST({ version: DiscordApiVersion }).setToken(DISCORD_TOKEN);

export const DiscordRequest = new TypedREST(client);
