import {
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  type ChatInputCommandInteraction,
  Role,
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import {
  add,
  get as getLevelRewards,
  remove,
  updateLevel,
} from "../../../utils/database/levelRewards.js";
import errorEmbed from "../../../utils/embeds/errorEmbed.js";

export type Reward = {
  roleId: string;
  level: number;
};

export default class Rewards {
  data: SlashCommandSubcommandBuilder;

  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("rewards")
      .setDescription("Sets/gets reward roles for leveling")
      .addRoleOption((option) =>
        option
          .setName("role")
          .setDescription("The targeted reward role, leave blank for lookup."),
      )
      .addNumberOption((option) =>
        option
          .setName("level")
          .setDescription(
            "Set the level requirement for this role. 0 => remove. blank => lookup.",
          ),
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.guildId) return;
    const inputLevel = interaction.options.getNumber("level", false) as
      | number
      | null;
    const inputRole = interaction.options.getRole("role", false) as Role | null;

    const rewards = this.getRewards(interaction.guildId);

    if (!inputRole) {
      if (rewards.length == 0) {
        return await interaction.followUp({
          embeds: [errorEmbed("There are no rewards set for this server.")],
        });
      }

      // List all the rewards
      if (!inputLevel) {
        const rewardsEmbed = new EmbedBuilder()
          .setTitle("🎁 • Rewards")
          .setDescription("Here are the rewards set for this server.")
          .setColor(genColor(100));
        for (const { roleId, level } of rewards) {
          if (!roleId) continue;
          rewardsEmbed.addFields([
            {
              name: `Level ${level}`,
              value: `<@&${roleId}>`,
            },
          ]);
        }
        return await interaction.followUp({
          embeds: [rewardsEmbed],
        });
      }

      // Get reward of a level
      const level = Number(inputLevel);

      const reward = rewards.find((reward) => reward.level == level);
      if (!reward) {
        return await interaction.followUp({
          embeds: [errorEmbed(`There is no reward set for level ${level}.`)],
        });
      }

      return await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎁 • Rewards for Lv. " + level)
            .setDescription(
              `This level has been linked to <@&${reward.roleId}>`,
            )
            .setColor(genColor(100)),
        ],
      });
    }

    const reward = rewards.find((reward) => reward.roleId == inputRole.id);

    // Get level of a role
    if (!inputLevel) {
      if (rewards.length == 0) {
        return await interaction.followUp({
          embeds: [errorEmbed("There are no rewards set for this server.")],
        });
      }
      if (!reward) {
        return await interaction.followUp({
          embeds: [errorEmbed("This role is not yet linked to any level.")],
        });
      }
      return await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle(`🎁 • Rewards for <@&${reward.roleId}>`)
            .setDescription(
              "This level has been linked to level " + reward.level,
            )
            .setColor(genColor(100)),
        ],
      });
    }

    // Permission check
    const user = interaction.guild.members.cache.get(interaction.user.id);
    if (!user) return;
    if (!user.permissions.has(PermissionsBitField.Flags.Administrator))
      return await interaction.followUp({
        embeds: [errorEmbed("You don't have permission to change rewards.")],
      });

    const level = Number(inputLevel);
    if (level < 0) {
      return await interaction.followUp({
        embeds: [errorEmbed("You can't set a reward for a negative level.")],
      });
    }

    // Remove reward
    if (level == 0) {
      if (!reward)
        return await interaction.followUp({
          embeds: [errorEmbed("This role is not yet linked to any level.")],
        });
      remove(interaction.guildId, reward.roleId);
      return await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle(`🎁 • Reward removed`)
            .setDescription(
              `<@&${reward.roleId}> will no longer be given out as a leveling reward.`,
            )
            .setColor(genColor(100)),
        ],
      });
    }

    if (reward) {
      updateLevel(interaction.guildId, reward.roleId, level);
    }

    const role = await interaction.guild.roles
      .fetch(String(inputRole?.id))
      .catch(() => null);

    if (!role) {
      return await interaction.followUp({
        embeds: [errorEmbed("That role doesn't exist or couldn't be loaded.")],
      });
    }

    // Safety check on the rewarded role
    const permissions = role?.permissions as PermissionsBitField;
    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return await interaction.followUp({
        embeds: [errorEmbed("That role is above mine.")],
      });
    }
    if (role?.name?.includes("everyone")) {
      return await interaction.followUp({
        embeds: [errorEmbed("I can't give out the @everyone role.")],
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
        embeds: [
          errorEmbed("I can't give out a role with dangerous permissions."),
        ],
      });
    }

    add(interaction.guildId, role.id, level);

    return await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle("🎁 • Rewards")
          .setDescription(
            `Set the reward for level ${level} to <@&${role?.id}>.`,
          )
          .setColor(genColor(100)),
      ],
    });
  }

  getRewards(guildId: string): Reward[] {
    return getLevelRewards(guildId).map((val) => ({
      level: val.level,
      roleId: val.role.toString(),
    }));
  }
}
