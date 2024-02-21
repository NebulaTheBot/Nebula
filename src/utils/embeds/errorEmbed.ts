import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { genColor } from "../colorGen";

/**
 * Sends the embed containing an error.
 * @param interaction The interaction (slash command).
 * @param title The error.
 * @param reason The reason of the error.
 * @returns Embed with the error description.
 */
export function errorEmbed(
  interaction: ChatInputCommandInteraction,
  title: string,
  reason?: string
) {
  const content = [`**${title}**`];
  if (reason != undefined) content.push(reason);
  const embed = new EmbedBuilder()
    .setTitle("❌  •  Something went wrong!")
    .setDescription(content.join("\n"))
    .setColor(genColor(0));

  return interaction.reply({ embeds: [embed], ephemeral: true });
}
