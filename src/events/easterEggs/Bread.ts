import type { Message } from "discord.js";
import { multiReact } from "../../utils/multiReact.js";

export default class Bread {
  async run(message: Message) {
    const gif = "https://tenor.com/bOMAb.gif";
    const randomizedChance = Math.round(Math.random() * 100);
    const breadSplit = message.content.toLowerCase().split("bread");
    if (breadSplit[1] == null) return;

    if (
      ((breadSplit[0].endsWith(" ") || breadSplit[0].endsWith("")) && breadSplit[1].startsWith(" ")) ||
      message.content.toLowerCase() === "bread"
    ) {
      if (randomizedChance <= 0.25) message.channel.send(gif);
      else await multiReact(message, "🍞🇧🇷🇪🇦🇩👍");
    }
  }
}
