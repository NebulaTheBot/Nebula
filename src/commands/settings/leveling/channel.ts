import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  type ChatInputCommandInteraction,
  ChannelType,
  Collection,
  NonThreadGuildBasedChannel
} from "discord.js";
import { genColor } from "../../../utils/colorGen.js";
import { errorEmbed } from "../../../utils/embeds/errorEmbed.js";
import { getSettingsTable } from "../../../utils/database.js";
import { QuickDB } from "quick.db";

export default class Channel {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db?: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("channel")
      .setDescription("Sets the channel for level up messages (no channel = no messages).")
      .addChannelOption(option => option
        .setName("channel")
        .setDescription("The channel where level up messages are sent in.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const db = this.db;
    const settingsTable = await getSettingsTable(db);

    const guild = interaction.guild;
    const user = interaction.user;
    const channel = interaction.options.getChannel("channel");
    const member = interaction.guild.members.cache.get(user.id);

    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return await interaction.followUp({
        embeds: [errorEmbed("You need **Manage Server** permissions to set a channel.")]
      });
    }

    if (!channel) {
      await settingsTable?.delete(`${guild.id}.leveling.channel`).catch(() => "");

      return await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle("✅ • Leveling Channel")
            .setDescription("Level up messages will no longer be sent.")
            .setColor(genColor(100))
        ]
      });
    }

    if (channel?.type != ChannelType.GuildText) {
      return await interaction.followUp({
        embeds: [errorEmbed("You must provide a text channel.")]
      });
    }

    const perms = (await guild.channels.fetch().then(
      (channels: Collection<string, NonThreadGuildBasedChannel>) => channels as Collection<string, NonThreadGuildBasedChannel>
    )).get(channel.id).permissionsFor(guild.members.me);
    if (!perms.has(PermissionsBitField.Flags.SendMessages)) {
      return await interaction.followUp({
        embeds: [errorEmbed("I don't have permission to send messages in that channel.")]
      });
    }

    await settingsTable.set(`${guild.id}.leveling.channel`, channel.id).catch(() => "");

    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ • Leveling Channel")
          .setDescription(`Level up messages will now be sent in <#${channel.id}>.`)
          .setColor(genColor(100))
      ]
    });
  }
}
