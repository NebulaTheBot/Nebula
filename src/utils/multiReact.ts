import type { Message } from "discord.js";

export async function multiReact(message: Message, ...reactions: string[]) {
  for (const i of reactions) {
    if (typeof i === "object") {
      await message.react(i);
      continue;
    }
    for (const reaction of i) if (reaction !== " ") await message.react(reaction);
  }
}
