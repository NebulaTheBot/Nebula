import { SlashCommandSubcommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import { getLevelingTable, getSettingsTable } from "../../utils/database.js";
import { errorEmbed } from "../../utils/embeds/errorEmbed.js";
import { QuickDB } from "quick.db";

export default class Leaderboard {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("leaderboard")
      .setDescription("Shows the server's leaderboard in levels.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const settingsTable = await getSettingsTable(this.db);
    const levelingTable = await getLevelingTable(this.db);

    // return await interaction.followUp({
    //   embeds: [errorEmbed("This command is under maintenance.")]
    // });

    const levelEnabled = await settingsTable?.get(`${interaction.guild.id}.leveling.enabled`).catch(() => { });
    const levels = await levelingTable?.get(`${interaction.guild.id}`).catch(() => { });
    const levelKeys = Object.keys(levels)
    const convertLevelsAndExpToExp = (levels: any) => {
      const exp = Object.keys(levels).map(level => levels[level].exp);
      return exp.reduce((a, b) => a + b);
    };

    if (!levelEnabled) return await interaction.followUp({
      embeds: [errorEmbed("Leveling is disabled for this server.")]
    });

    const embed = new EmbedBuilder()
      .setTitle("⚡ • Top 10 active members")
      .setDescription(levelKeys
        .slice(0, 10)
        .map(level => [
          `#${Object.keys(levels).indexOf(level) + 1} • <@${level}>`,
          `**Level ${levels[level].levels}** - Next Level: ${levels[level].levels + 1}`,
          `**Exp**: ${levels[level].exp}/${Math.floor((2 * 50) * 1.25 * (levels[level].levels + 1))} until level up`
        ])
        .join("\n\n"))
      .setColor(genColor(200))
      .setTimestamp();

    await interaction.followUp({ embeds: [embed] });
  }
}
