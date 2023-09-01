import { SlashCommandSubcommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import { getLevelingTable, getSettingsTable } from "../../utils/database.js";
import { BASE_EXP_FOR_NEW_LEVEL, DIFFICULTY_MULTIPLIER } from "../../events/leveling.js";
import errorEmbed from "../../utils/embeds/errorEmbed.js";
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
    const db = this.db;
    const settingsTable = await getSettingsTable(db);
    const levelingTable = await getLevelingTable(db);

    // Under maintenance
    return await interaction.followUp({
      embeds: [errorEmbed("This command is under maintenance.")]
    });

    const guild = interaction.guild;
    const levelEnabled = await settingsTable?.get(`${guild.id}.leveling.enabled`).catch(() => { });
    const levels = await levelingTable?.get(`${guild.id}`).catch(() => { });
    const levelKeys = Object.keys(levels)
    const convertLevelsAndExpToExp = (levels: any) => {
      const exp = Object.keys(levels).map(level => levels[level].exp);
      return exp.reduce((a, b) => a + b);
    };

    if (!levelEnabled)
      return await interaction.followUp({ embeds: [errorEmbed("Leveling is disabled for this server.")] });

    const levelUpEmbed = new EmbedBuilder()
      .setTitle("⚡ • Top 10 active members")
      .setDescription(
        levelKeys.slice(0, 10).map(level =>
          `#${Object.keys(levels).indexOf(level) + 1} • <@${level}>\n**Level ${levels[level].levels}** - Next Level: ${levels[level].levels + 1}\n**Exp**: ${levels[level].exp}/${Math.floor(BASE_EXP_FOR_NEW_LEVEL * DIFFICULTY_MULTIPLIER * (levels[level].levels + 1))} until level up`
        ).join("\n\n")
      )
      .setColor(genColor(200))
      .setTimestamp();

    await interaction.followUp({ embeds: [levelUpEmbed] });
  }
}
