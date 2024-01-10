import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  type ChatInputCommandInteraction,
  Role,
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import {get as getLevelRewards} from "../../../utils/database/levelRewards.js";
import errorEmbed from "../../../utils/embeds/errorEmbed.js";

export type Reward = {
  roleId: string,
  level: number,
}

export default class Rewards {
  data: SlashCommandSubcommandBuilder;

  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("rewards")
      .setDescription("Sets/gets reward roles for each level -> No options = shows.")
      .addNumberOption(option => option
        .setName("level")
        .setDescription("The level to set the reward role for. When set without role option => deletes reward.")
      )
      .addRoleOption(option => option
        .setName("role")
        .setDescription("The role that should be awarded for the level => leaving empty = deletes reward for specified level.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {

    const inputLevel = interaction.options.getNumber("level", false) as number | null;
    const inputRole = interaction.options.getRole("role", false) as Role | null;

    if (!inputLevel && !inputRole) {
      // List the rewards
      const rewards = this.getRewards();
      if (rewards.length == 0) {
        return await interaction.followUp({
          embeds: [errorEmbed("There are no rewards set for this server.")]
        });
      }

      const rewardsEmbed = new EmbedBuilder()
        .setTitle("🎁 • Rewards")
        .setDescription("Here are the rewards set for this server.")
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
    } else if (inputLevel && !inputRole) {
      // Delete a reward
      const level = Number(inputLevel);
      const rewards = await this.getRewards(interaction.guild.id).then(rewards => rewards.sort((a, b) => a?.level - b?.level)) as Reward[];
      if (rewards.length == 0) {
        return await interaction.followUp({
          embeds: [errorEmbed("There are no rewards set for this server.")]
        });
      }

      const reward = rewards.find(reward => reward?.level == level);
      if (!reward) {
        return await interaction.followUp({
          embeds: [errorEmbed(`There is no reward set for level ${level}.`)]
        });
      }

      const newRewards = rewards.filter(reward => reward.level != level);
      await settingsTable?.set(`${interaction.guild.id}.leveling.rewards`, newRewards).catch(() => []);

      return await interaction.followUp({
        embeds: [new EmbedBuilder()
          .setTitle("🎁 • Rewards")
          .setDescription(`Deleted the reward for level ${level}.`)
          .setColor(genColor(100))
        ]
      });
    }

    // Set a reward
    const level = Number(inputLevel);
    const role = await interaction.guild.roles.fetch(String(inputRole?.id)).catch(() => null);

    if (!role) {
      return await interaction.followUp({
        embeds: [errorEmbed("That role doesn't exist or couldn't be loaded.")]
      });
    }

    const permissions = role?.permissions as PermissionsBitField;
    if (level < 0) {
      return await interaction.followUp({
        embeds: [errorEmbed("You can't set a reward for a negative level.")]
      });
    }
    if (level == 0) {
      return await interaction.followUp({
        embeds: [errorEmbed("You can't set a reward for level 0.")]
      });
    }
    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return await interaction.followUp({
        embeds: [errorEmbed("That role is above mine.")]
      });
    }
    if (role?.name?.includes("everyone")) {
      return await interaction.followUp({
        embeds: [errorEmbed("I can't give out the @everyone role.")]
      });
    }
    if (
      permissions.has(PermissionsBitField.Flags.Administrator) ||
      permissions.has(PermissionsBitField.Flags.ManageRoles) ||
      permissions.has(PermissionsBitField.Flags.ManageGuild) ||
      permissions.has(PermissionsBitField.Flags.ManageChannels) ||
      permissions.has(PermissionsBitField.Flags.ManageWebhooks) ||
      permissions.has(PermissionsBitField.Flags.ManageGuildExpressions) ||
      permissions.has(PermissionsBitField.Flags.ManageMessages) ||
      permissions.has(PermissionsBitField.Flags.ManageThreads) ||
      permissions.has(PermissionsBitField.Flags.ManageNicknames)
    ) {
      return await interaction.followUp({
        embeds: [errorEmbed("I can't give out a role with dangerous permissions.")]
      });
    }

    const rewards = await this.getRewards(interaction.guildId);
    const newRewards = rewards.filter(reward => reward.level != level);
    newRewards.push({
      roleId: role?.id,
      level: level
    });
    await settingsTable?.set(`${interaction.guild.id}.leveling.rewards`, newRewards).catch(() => "");

    return await interaction.followUp({
      embeds: [new EmbedBuilder()
        .setTitle("🎁 • Rewards")
        .setDescription(`Set the reward for level ${level} to <@&${role?.id}>.`)
        .setColor(genColor(100))
      ]
    });
  }

  getRewards(guildId: string): Reward[] {
      return getLevelRewards(guildId).map((val)=>({level: val.level, roleId: val.role.toString()}))
  }
}
