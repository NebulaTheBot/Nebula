import { EmbedBuilder } from "discord.js";
import { genColor } from "../colorGen";

/**
 * Sends the embed containing an error.
 * @param description Description of the error.
 * @returns Embed with the error description.
 */
export function errorEmbed(description: string) {
  return new EmbedBuilder()
    .setTitle("❌ • Error!")
    .setDescription(description)
    .setColor(genColor(0));
}
