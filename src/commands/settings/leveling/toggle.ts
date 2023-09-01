import {
  SlashCommandSubcommandBuilder, EmbedBuilder,
  type ChatInputCommandInteraction,
  PermissionsBitField,
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import database from "../../../utils/database.js";
import errorEmbed from "../../../utils/embeds/errorEmbed.js";

export default class Toggle {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("toggle")
      .setDescription("Toggles if leveling is enabled.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = await database();

    const enabled = await db.table("settings")?.get(`${interaction.guild.id}.leveling.enabled`).then(
      (enabled) => !!enabled
    ).catch(() => false);
    await db.table("settings").set(`${interaction.guild.id}.leveling.enabled`, !enabled);

    const user = (await interaction.guild.members.me.fetch())
    if (!user.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return await interaction.followUp({
        embeds: [errorEmbed("You need **Manage Server** permissions to toggle leveling.")]
      });
    }

    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ • Leveling toggled!")
          .setDescription(`Leveling is now ${enabled ? "disabled" : "enabled"}.`)
          .setColor(genColor(100))
      ]
    });
  }
}
