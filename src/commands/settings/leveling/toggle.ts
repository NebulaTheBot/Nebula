import {
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  PermissionsBitField,
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import { get, set } from "../../../utils/database/settings.js";
import errorEmbed from "../../../utils/embeds/errorEmbed.js";

export default class Toggle {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("toggle")
      .setDescription("Toggles if leveling is enabled.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId || !interaction.guild) return;

    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (!member?.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return await interaction.followUp({
        embeds: [
          errorEmbed(
            "You need **Manage Server** permissions to set a channel.",
          ),
        ],
      });
    }

    const enabled = get(interaction.guildId, "leveling.enabled");

    set(interaction.guildId, "leveling.enabled", !enabled);

    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ • Leveling toggled!")
          .setDescription(
            `Leveling is now ${enabled ? "disabled" : "enabled"}.`,
          )
          .setColor(genColor(100)),
      ],
    });
  }
}
