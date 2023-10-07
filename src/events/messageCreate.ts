import type { Message } from "discord.js";
import { pathToFileURL } from "url";
import { join } from "path";
import { readdirSync } from "fs";

export default {
  name: "messageCreate",
  event: class MessageCreate {
    async run(message: Message) {
      if (message.author.bot) return;
      if (message.guildId !== "903852579837059113") return;
      const eventsPath = join(process.cwd(), "src", "events", "easterEggs");

      for (const easterEggFile of readdirSync(eventsPath)) {
        const msg = await import(pathToFileURL(join(eventsPath, easterEggFile)).toString());
        new msg.default().run(message, ...message.content);
      }
    }
  }
};
