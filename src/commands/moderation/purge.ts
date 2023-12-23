import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  ChannelType, TextChannel, type Channel,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import { errorEmbed } from "../../utils/embeds/errorEmbed.js";
import { getSettingsTable } from "../../utils/database.js";
import { QuickDB } from "quick.db";

export default class Purge {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("purge")
      .setDescription("Purges messages.")
      .addNumberOption(number => number
        .setName("amount")
        .setDescription("The amount of messages that you want to purge.")
        .setRequired(true)
      )
      .addChannelOption(channel => channel
        .setName("channel")
        .setDescription("The channel that you want to purge. Leave empty if you want to purge the current channel.")
        .addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread)
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getNumber("amount");
    const member = interaction.guild.members.cache.get(interaction.member.user.id);

    if (amount > 100) return await interaction.followUp({
      embeds: [errorEmbed("You can only purge up to 100 messages at a time.")],
    });

    if (amount < 1) return await interaction.followUp({
      embeds: [errorEmbed("You must purge at least 1 message.")],
    });

    if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return await interaction.followUp({
      embeds: [errorEmbed("You need the **Manage Messages** permission to execute this command.")],
    });

    const channelOption = interaction.options.getChannel("channel");
    const channel = interaction.guild.channels.cache.get(interaction.channel.id ?? channelOption.id);
    const embed = new EmbedBuilder()
      .setTitle(`✅ • Purged ${amount} messages.`)
      .setDescription([
        `**Moderator**: <@${member.id}>`,
        `**Channel**: ${channelOption ?? `<#${channel.id}>`}`,
      ].join("\n"))
      .setColor(genColor(100));

    if (channel.type === ChannelType.GuildText && ChannelType.PublicThread && ChannelType.PrivateThread) channel == interaction.channel
      ? await channel.bulkDelete(amount + 1, true)
      : await channel.bulkDelete(amount, true);

    const logChannel = await (await getSettingsTable(this.db))
      ?.get(`${interaction.guild.id}.logChannel`)
      .then((channel: string | null) => channel)
      .catch(() => null);

    if (logChannel) {
      const channel = await interaction.guild.channels.cache
        .get(logChannel)
        .fetch()
        .then((channel: Channel) => {
          if (channel.type != ChannelType.GuildText) return null;
          return channel as TextChannel;
        })
        .catch(() => null);

      if (channel) await channel.send({ embeds: [embed] });
    }

    await interaction.followUp({ embeds: [embed] });
  }
}
