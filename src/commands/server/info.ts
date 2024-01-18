import { SlashCommandSubcommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { serverEmbed } from "../../utils/embeds/serverEmbed.js";

export default class ServerInfo {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("info")
      .setDescription("Shows this server's info.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const embed = await serverEmbed({ guild: interaction.guild!, roles: true });
    await interaction.followUp({ embeds: [embed] });
  }
}
