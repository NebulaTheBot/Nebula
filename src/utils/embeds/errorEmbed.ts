import { EmbedBuilder } from "discord.js";
import { genColor } from "../colorGen";

/**
 * Sends the embed containing an error.
 * @param error The error.
 * @param reason The reason of the error.
 * @returns Embed with the error description.
 */
export function errorEmbed(error: string, reason: string) {
  return new EmbedBuilder()
    .setTitle("❌ • Error!")
    .setDescription([`**${error}**`, `Reason: ${reason}`].join("\n"))
    .setColor(genColor(0));
}
