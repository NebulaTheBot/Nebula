// TODO: SQLite Migration
import {
  SlashCommandSubcommandBuilder, EmbedBuilder, PermissionsBitField,
  type ChatInputCommandInteraction, TextChannel, DMChannel,
  Channel, ChannelType
} from "discord.js";
import { genColor } from "../../utils/colorGen.js";
import errorEmbed from "../../utils/embeds/errorEmbed.js";
import { getSettingsTable } from "../../utils/database.js";
import { QuickDB } from "quick.db";

export default class Unmute {
  data: SlashCommandSubcommandBuilder;
  db: QuickDB<any>;

  constructor(db: QuickDB<any>) {
    this.db = db;
    this.data = new SlashCommandSubcommandBuilder()
      .setName("unmute")
      .setDescription("Unmutes a user.")
      .addUserOption(user => user
        .setName("user")
        .setDescription("The user that you want to unmute.")
        .setRequired(true)
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");
    const members = interaction.guild.members.cache;
    const member = members.get(interaction.member.user.id);
    const selectedMember = members.get(user.id);
    const name = selectedMember.nickname ?? user.username;

    const dmChannel = (await user.createDM().catch(() => null)) as DMChannel | null;;
    let unmuteEmbed = new EmbedBuilder()
      .setTitle(`✅ • Unmuted ${user.username}`)
      .setDescription([
        `**Moderator**: <@${interaction.user.id}>`,
        `**Date**: <t:${Math.floor(Date.now() / 1000)}:f>`
      ].join("\n"))
      .setAuthor({ name: `• ${name}`, iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(genColor(100));
    const embedDM = new EmbedBuilder()
      .setTitle(`🤝 • You were unmuted`)
      .setDescription([
        `**Moderator**: ${interaction.user.username}`,
        `**Date**: <t:${Math.floor(Date.now() / 1000)}:f>`
      ].join("\n"))
      .setThumbnail(user.displayAvatarURL())
      .setAuthor({ name: `• ${user.username}`, iconURL: user.displayAvatarURL() })
      .setFooter({ text: `User ID: ${user.id}` })
      .setColor(genColor(100));

    if (!member.permissions.has(PermissionsBitField.Flags.MuteMembers))
      return await interaction.followUp({ embeds: [errorEmbed("You need the **Mute Members** permission to execute this command.")] });

    const db = this.db;
    const settingsTable = await getSettingsTable(db);
    const logChannel = await settingsTable?.get(`${interaction.guild.id}.logChannel`).then(
      (channel: string | null) => channel
    ).catch(() => null);
    if (logChannel) {
      const channel = await interaction.guild.channels.cache.get(logChannel).fetch().then(
        (channel: Channel) => {
          if (channel.type != ChannelType.GuildText) return null;
          return channel as TextChannel;
        }
      ).catch(() => null);
      if (channel) await channel.send({ embeds: [unmuteEmbed] });
    }

    if (dmChannel) await dmChannel.send({ embeds: [embedDM] });
    await selectedMember.edit({ communicationDisabledUntil: null });
    await interaction.followUp({ embeds: [unmuteEmbed] });
  }
}
