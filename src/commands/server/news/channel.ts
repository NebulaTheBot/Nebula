import {
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  type ChatInputCommandInteraction,
  ChannelType
} from "discord.js";
import { genColor } from "../../../utils/colorGen";
import { errorEmbed } from "../../../utils/embeds/errorEmbed";

export default class Channel {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("channel")
      .setDescription(
        "Sets/removes (when no options) a news channel, all news you post will be sent."
      )
      .addChannelOption(option =>
        option.setName("channel").setDescription("The channel to send news to.")
      )
      .addRoleOption(option =>
        option.setName("role").setDescription("The role to ping when news are sent.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild!;
    const channelOption = interaction.options.getChannel("channel")!;
    const roleOption = interaction.options.getRole("role");
    const channel = guild.channels.cache.get(channelOption?.id)!;
    const role = guild.roles.cache.get(roleOption?.id ?? "");

    if (!channelOption && !roleOption) {
      await newsTable.delete(`${guild.id}.channel`);
      return await interaction.reply({
        embeds: [new EmbedBuilder().setTitle("✅ • Removed news channel.")]
      });
    }

    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return await interaction.reply({
        embeds: [errorEmbed("You need **Manage Server** permissions to add news.")]
      });
    }
    if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
      return await interaction.reply({
        embeds: [errorEmbed("The channel must be a text channel.")]
      });
    }

    await newsTable.set(`${guild.id}.channel`, {
      channelId: channel.id,
      roleId: role?.id ?? ""
    });

    const embed = new EmbedBuilder().setTitle("✅ • News channel set!").setColor(genColor(100));
    if (role) embed.setDescription(`The role <@&${role.id}> will be pinged when news are sent.`);
    await interaction.reply({
      embeds: [new EmbedBuilder().setTitle("✅ • News channel set!").setColor(genColor(100))]
    });
  }
}
