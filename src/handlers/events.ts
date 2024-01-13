import type { Client } from "discord.js";
import { pathToFileURL } from "url";
import { join } from "path";
import { readdirSync } from "fs";

export default class Events {
  client: Client;
  events: any[] = [];

  constructor(client: Client) {
    this.client = client;

    (async () => {
      const eventsPath = join(process.cwd(), "src", "events");

      for (const eventFile of readdirSync(eventsPath)) {
        if (!eventFile.endsWith("ts")) continue;

        const event = await import(pathToFileURL(join(eventsPath, eventFile)).toString());
        const clientEvent = client.on(event.default.name, new event.default.event(client).run);

        this.events.push({ name: event.default.name, event: clientEvent });
      }
    })();
  }
}
