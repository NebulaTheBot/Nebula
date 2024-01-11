// TODO: SQLite Migration
import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  type ChatInputCommandInteraction,
  Role,
} from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import errorEmbed from "../../utils/embeds/errorEmbed.js";
import { getSettingsTable } from "../../utils/database.js";
import { QuickDB } from "quick.db";

export type Reward = {
  roleId: string,
  level: number,
}

export default class Rewards {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("rewards")
      .setDescription("Sets/gets reward roles for each level -> No options = shows.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    // List the rewards
    const rewards = await this.getRewards(interaction.guild.id).then(rewards => rewards.sort((a, b) => a.level - b.level)) as Reward[];
    if (rewards.length == 0) {
      return await interaction.followUp({
        embeds: [errorEmbed("There are no rewards set for this server.")]
      });
    }

    const rewardsEmbed = new EmbedBuilder()
      .setTitle("🎁 • Rewards")
      .setDescription("Here are the rewards in this server.")
      .setColor(genColor(100));

    for (const { roleId, level } of rewards) {
      if (!roleId) continue;
      rewardsEmbed.addFields([{
        name: `Level ${level}`,
        value: `<@&${roleId}>`,
      }]);
    }

    return await interaction.followUp({
      embeds: [rewardsEmbed]
    });
  }

  async getRewards(guildId: string): Promise<Reward[]> {
    const settingsTable = await getSettingsTable(this.db);
    const rewards = new Promise((resolve, reject) => {
      settingsTable?.get(`${guildId}.leveling.rewards`).then(rewards => {
        if (!rewards) return resolve([]);
        resolve(rewards);
      }).catch(() => {
        resolve([]);
      });
    });
    return rewards as Promise<Reward[]>;
  }
}
