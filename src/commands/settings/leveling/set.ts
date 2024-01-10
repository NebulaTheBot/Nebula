import {
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  User,
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import { set as setLevel } from "../../../utils/database/leveling.js";
import {get as getLevelRewards} from "../../../utils/database/levelRewards.js";
import errorEmbed from "../../../utils/embeds/errorEmbed.js";
import { Reward } from "./rewards.js";

export default class Set {
  data: SlashCommandSubcommandBuilder;

  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("set")
      .setDescription("Sets the levels for a user.")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to set the levels for.")
          .setRequired(true),
      )
      .addNumberOption((option) =>
        option
          .setName("levels")
          .setDescription("The amount of levels to set the user to.")
          .setRequired(true),
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId || !interaction.guild) return;

    const target: User = interaction.options.getUser("user", true);
    const level: number = interaction.options.getNumber("levels", true);

    if (level < 0) {
      return await interaction.followUp({
        embeds: [
          errorEmbed("You can't set a user's levels to a negative number."),
        ],
      });
    }

    setLevel(interaction.guildId, target.id, level, 0);

    const levelRewards = getLevelRewards(interaction.guildId)
    const members = await interaction.guild.members.fetch();
    for (const { level: rewardLevel, role } of levelRewards) {
      const roleFetched = interaction.guild.roles.cache.get(role.toString());
      if (!roleFetched) continue;

      if (level >= rewardLevel) {
        await members.get(target.id)?.roles.add(roleFetched);
        continue;
      }

      await members.get(target.id)?.roles.remove(roleFetched);
    }

    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ • Levels set!")
          .setDescription(`Set ${target}'s levels to ${level}.`)
          .setColor(genColor(100)),
      ],
    });
  }
}
