import { EmbedBuilder } from "discord.js";
import { genColor } from "../colorGen";

/**
 * Sends the embed containing an error.
 * @param title The error.
 * @param reason The reason of the error.
 * @returns Embed with the error description.
 */
export function errorEmbed(title: string, reason?: string) {
  const content = [`**${title}**`];
  if (reason != undefined) content.push(reason);

  return new EmbedBuilder()
    .setTitle("❌ • Something went wrong!")
    .setDescription(content.join("\n"))
    .setColor(genColor(0));
}
