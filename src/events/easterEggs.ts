import type { Message } from "discord.js";
import { pathToFileURL } from "url";
import { join } from "path";
import { readdirSync } from "fs";

export default {
  name: "messageCreate",
  event: class MessageCreate {
    async run(message: Message) {
      if (message.author.bot) return;
      if (message.guildId !== "903852579837059113" && message.guildId !== "986268144446341142") return;
      const eventsPath = join(process.cwd(), "src", "events");

      for (const easterEggFile of readdirSync(join(eventsPath, "easterEggs"))) {
        const msg = await import(pathToFileURL(join(eventsPath, "easterEggs", easterEggFile)).toString());
        new msg.default().run(message, ...message.content);
      }
    }
  },
};
