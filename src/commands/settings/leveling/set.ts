import {
  SlashCommandSubcommandBuilder, EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import errorEmbed from "../../../utils/embeds/errorEmbed.js";
import { getLevelingTable, getSettingsTable } from "../../../utils/database.js";
import { QuickDB } from "quick.db";
import { Reward } from "./rewards.js";

export default class Set {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("set")
      .setDescription("Sets the levels for a user.")
      .addUserOption(option => option
        .setName("user")
        .setDescription("The user to set the levels for.")
        .setRequired(true)
      )
      .addNumberOption(option => option
        .setName("levels")
        .setDescription("The amount of levels to set the user to.")
        .setRequired(true)
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const levelingTable = await getLevelingTable(db);
    const settingsTable = await getSettingsTable(db);

    const target = interaction.options.getUser("user", true);
    const level = interaction.options.getNumber("levels", true);

    if (level < 0) {
      return await interaction.followUp({
        embeds: [errorEmbed("You can't set a user's levels to a negative number.")]
      });
    }

    await levelingTable.set(`${interaction.guild.id}.${target.id}`, {
      levels: level,
      exp: 0
    }).catch(() => "");

    const levelRewards = await settingsTable?.get(`${interaction.guild.id}.leveling.rewards`).then(
      (data) => {
        if (!data) return [] as Reward[];
        return data as Reward[] ?? [] as Reward[];
      }
    ).catch(() => [] as Reward[]);
    const members = await interaction.guild.members.fetch();
    for (const { level: rewardLevel, roleId } of levelRewards) {
      const role = interaction.guild.roles.cache.get(roleId);

      if (level >= rewardLevel) {
        await members.get(target.id)?.roles.add(role);
        continue;
      }

      await members.get(target.id)?.roles.remove(role);
    }

    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ • Levels set!")
          .setDescription(`Set ${target}'s levels to ${level}.`)
          .setColor(genColor(100))
      ]
    });
  }
}
